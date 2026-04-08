import { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { faPlus, faArrowRightFromBracket, faChevronDown, faChevronUp, faBars, faXmark, faSliders } from '@fortawesome/free-solid-svg-icons';
import { faNoteSticky } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useUIStore } from '../../stores/uiStore.js';
import { useEntriesStore } from '../../stores/entriesStore.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { useEncryption } from '../../contexts/EncryptionContext.js';
import { useNavigate, useLocation, Link } from 'react-router-dom';

function isLightColor(hex: string): boolean {
  if (hex === 'transparent') return false;
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.75;
}

const HeaderBar = styled.header<{ $bgColor: string; $light: boolean }>`
  display: flex;
  align-items: center;
  padding: 0 16px;
  height: 65px;
  background: ${({ $bgColor }) => $bgColor};
  color: ${({ $light }) => $light ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.9)'};
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.header};
  font-family: ${({ theme }) => theme.fontFamily.ui};
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  @media (max-width: 480px) { gap: 6px; }
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
`;

const LogoText = styled.span<{ $light?: boolean }>`
  font-family: ${({ theme }) => theme.fontFamily.serif};
  font-size: 24px;
  font-weight: 100;
  font-style: italic;
  text-transform: uppercase;
  letter-spacing: 0.12rem;
  color: inherit;
  text-shadow: ${({ $light }) => $light ? 'none' : '1px 1px 5px #00000080'};
  margin-bottom: 0.5rem;
  @media (max-width: 480px) { font-size: 20px; margin-bottom: 0.3rem; }
`;

const NewEntryButton = styled.button<{ $light?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  font-size: 12px;
  @media (max-width: 480px) { font-size: 22px; padding: 5px 2px; }
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.09rem;
  color: ${({ $light }) => $light ? 'rgba(0,0,0,0.7)' : 'rgba(255, 255, 255, 0.85)'};
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.15s;

  &:hover { color: ${({ $light }) => $light ? 'rgba(0,0,0,0.9)' : 'white'}; }
`;

const NewEntryLabel = styled.span`
  @media (max-width: 480px) { display: none; }
`;

const Divider = styled.div`
  width: 1px;
  height: 24px;
  background: currentColor;
  opacity: 0.25;
  margin: 0 4px;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  margin-left: auto;
  gap: 0;

  @media (max-width: 1199px) {
    display: none;
  }
`;

const NavLink = styled(Link)<{ $active?: boolean; $light?: boolean }>`
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.09rem;
  color: ${({ $active, $light }) => $active
    ? ($light ? 'rgba(0,0,0,0.9)' : 'white')
    : ($light ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)')};
  text-decoration: none;
  transition: color 0.15s;
  white-space: nowrap;

  &:hover { color: ${({ $light }) => $light ? 'rgba(0,0,0,0.9)' : 'white'}; }
`;

const DropdownWrapper = styled.div`
  position: relative;
`;

const DropdownTrigger = styled.button<{ $active?: boolean; $light?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.09rem;
  color: ${({ $active, $light }) => $active
    ? ($light ? 'rgba(0,0,0,0.9)' : 'white')
    : ($light ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)')};
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.15s;
  white-space: nowrap;

  &:hover { color: ${({ $light }) => $light ? 'rgba(0,0,0,0.9)' : 'white'}; }
`;

const DropdownChevron = styled.span`
  font-size: 9px;
  margin-left: 2px;
`;

const DropdownMenu = styled.div<{ $bgColor: string }>`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  min-width: 160px;
  padding: 4px 0;
  background: ${({ $bgColor }) => $bgColor};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  box-shadow: ${({ theme }) => theme.shadow.lg};
  animation: dropdownIn 0.15s ease-out;

  @keyframes dropdownIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const DropdownItem = styled(Link)<{ $light?: boolean }>`
  display: block;
  padding: 8px 16px;
  font-family: ${({ theme }) => theme.fontFamily.ui};
  font-size: 12px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.09rem;
  color: ${({ $light }) => $light ? 'rgba(0,0,0,0.6)' : 'rgba(255, 255, 255, 0.7)'};
  text-decoration: none;
  transition: background 0.1s, color 0.15s;

  &:hover {
    color: ${({ $light }) => $light ? 'rgba(0,0,0,0.9)' : 'white'};
    background: ${({ $light }) => $light ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.2)'};
  }
`;

const LogoutButton = styled.button<{ $light?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.09rem;
  color: ${({ $light }) => $light ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)'};
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.15s;

  &:hover { color: ${({ $light }) => $light ? 'rgba(0,0,0,0.9)' : 'white'}; }
`;

const HamburgerButton = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin-left: auto;
  color: rgba(255, 255, 255, 0.9);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;

  @media (max-width: 1199px) {
    display: flex;
  }
`;

const MobileDrawerOverlay = styled.div<{ $open: boolean }>`
  display: none;
  position: fixed;
  inset: 0;
  z-index: ${({ theme }) => theme.zIndex.modal};
  background: rgba(0, 0, 0, 0.4);
  opacity: ${({ $open }) => $open ? 1 : 0};
  transition: opacity 0.2s ease;
  pointer-events: ${({ $open }) => $open ? 'auto' : 'none'};

  @media (max-width: 1199px) {
    display: block;
  }
`;

const MobileDrawer = styled.div<{ $open: boolean; $bgColor: string }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 280px;
  max-width: 80vw;
  height: 100vh;
  z-index: ${({ theme }) => theme.zIndex.modal + 1};
  background: ${({ $bgColor }) => $bgColor};
  transform: translateX(${({ $open }) => $open ? '0' : '100%'});
  transition: transform 0.25s ease;
  display: none;
  flex-direction: column;
  overflow-y: auto;

  @media (max-width: 1199px) {
    display: flex;
  }
`;

const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
`;

const DrawerCloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: rgba(255, 255, 255, 0.9);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
`;

const DrawerNav = styled.nav`
  display: flex;
  flex-direction: column;
  padding: 8px 0;
`;

const DrawerLink = styled(Link)<{ $active?: boolean }>`
  display: block;
  padding: 12px 20px;
  font-size: 12px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.09rem;
  color: ${({ $active }) => $active ? 'white' : 'rgba(255,255,255,0.75)'};
  text-decoration: none;
  transition: background 0.1s;

  &:hover { background: rgba(255,255,255,0.1); }
`;

const DrawerSectionLabel = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 20px;
  font-size: 12px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.75);
  text-transform: uppercase;
  letter-spacing: 0.09rem;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;
  &:hover { background: rgba(255,255,255,0.1); }
`;

const DrawerDivider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.15);
`;

const DrawerLogout = styled.button`
  display: block;
  width: 100%;
  padding: 12px 20px;
  font-size: 12px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.09rem;
  color: rgba(255, 255, 255, 0.75);
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;

  &:hover { background: rgba(255,255,255,0.1); }
`;

interface NavDropdownProps {
  label: React.ReactNode;
  items: { label: string; to: string }[];
  activePath: string;
  bgColor?: string;
  light?: boolean;
}

function NavDropdown({ label, items, activePath, bgColor, light }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isActive = items.some(item => activePath.startsWith(item.to));

  const closeMenu = useCallback(() => {
    if (open && !closing) {
      setClosing(true);
      setTimeout(() => {
        setOpen(false);
        setClosing(false);
      }, 150);
    }
  }, [open, closing]);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open, closeMenu]);

  return (
    <DropdownWrapper ref={wrapperRef}>
      <DropdownTrigger $active={isActive || open} $light={light} onClick={() => open ? closeMenu() : setOpen(true)}>
        {label}
        <DropdownChevron style={{ transform: open && !closing ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
          <FontAwesomeIcon icon={faChevronDown} />
        </DropdownChevron>
      </DropdownTrigger>
      {open && (
        <DropdownMenu $bgColor={bgColor || '#4E6E7E'} style={closing ? { opacity: 0, transform: 'translateY(-4px)', transition: 'opacity 0.15s, transform 0.15s' } : undefined}>
          {items.map(item => (
            <DropdownItem key={item.to} to={item.to} $light={light} onClick={() => { closeMenu(); }}>
              {item.label}
            </DropdownItem>
          ))}
        </DropdownMenu>
      )}
    </DropdownWrapper>
  );
}

export function Header() {
  const headerColor = useUIStore(s => s.headerColor);
  const featureFlags = useEntriesStore(s => s.featureFlags);
  const { logout } = useAuth();
  const { lock } = useEncryption();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [drawerSections, setDrawerSections] = useState<Record<string, boolean>>({ planning: false, health: false, quicklinks: false });
  const toggleDrawerSection = (key: string) => setDrawerSections(prev => ({ ...prev, [key]: !prev[key] }));

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    lock();
    await logout();
    navigate('/login');
  };

  const handleNewEntry = () => {
    useUIStore.getState().setSelectedEntryId(null);
    useUIStore.getState().setShowMobileEditor(true);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;
  const bgColor = headerColor || '#4E6E7E';
  const light = isLightColor(bgColor);

  // Feature-gated nav items
  const ff = featureFlags;
  // Planning dropdown items — each gated by its own flag
  const goalsItems: { label: string; to: string }[] = [];
  if (ff.goalsEnabled) goalsItems.push({ label: 'Goals', to: '/goals' });
  if (ff.milestonesEnabled) goalsItems.push({ label: 'Milestones', to: '/goals/milestones' });
  goalsItems.push({ label: 'Tasks', to: '/goals/tasks' });
  goalsItems.push({ label: 'Todos', to: '/goals/todos' });
  goalsItems.push({ label: 'Menu Planner', to: '/menu' });
  goalsItems.push({ label: 'Shopping Lists', to: '/shopping' });

  const healthItems: { label: string; to: string }[] = [];
  if (ff.medicationEnabled) {
    healthItems.push({ label: 'Meds List', to: '/health/meds' });
    healthItems.push({ label: 'Meds Schedule', to: '/health/schedule' });
  }
  if (ff.foodEnabled) healthItems.push({ label: 'Food', to: '/health/food' });
  if (ff.medicationEnabled) healthItems.push({ label: 'Symptoms', to: '/health/symptoms' });
  if (ff.exerciseEnabled) healthItems.push({ label: 'Exercise', to: '/health/exercise' });
  if (ff.allergiesEnabled) healthItems.push({ label: 'Allergies', to: '/health/allergies' });
  if (healthItems.length > 0) healthItems.push({ label: 'Reporting', to: '/health/reporting' });

  const mobileNav = (to: string, label: string) => (
    <DrawerLink to={to} $active={isActive(to)} onClick={() => setMobileMenuOpen(false)}>
      {label}
    </DrawerLink>
  );

  return (
    <>
      <HeaderBar $bgColor={bgColor} $light={light}>
        <LeftSection>
          <Logo to="/" onClick={() => {
            useUIStore.getState().setViewMode('all');
            useUIStore.getState().setSelectedTopicId(null);
            useUIStore.getState().setSelectedEntryId(null);
            useUIStore.getState().setShowMobileEditor(false);
          }}>
            <LogoText $light={light}>Chronicles</LogoText>
          </Logo>
          <Divider />
          <NewEntryButton $light={light} onClick={handleNewEntry}>
            <FontAwesomeIcon icon={faPlus} size="sm" />
            <NewEntryLabel>New Entry</NewEntryLabel>
          </NewEntryButton>
        </LeftSection>

        <Nav>
          <NavLink to="/" $active={isActive('/')} $light={light}>Journal</NavLink>
          <NavLink to="/topics" $active={isActive('/topics')} $light={light}>Topics</NavLink>
          <NavLink to="/calendar" $active={isActive('/calendar')} $light={light}>Calendar</NavLink>
          {goalsItems.length > 0 && (
            <NavDropdown
              label="Planner"
              activePath={location.pathname}
              items={goalsItems}
              bgColor={bgColor}
              light={light}
            />
          )}

          {healthItems.length > 0 && (
            <NavDropdown
              label="Health"
              activePath={location.pathname}
              items={healthItems}
              bgColor={bgColor}
              light={light}
            />
          )}

          {(ff.entertainmentEnabled || ff.inspirationEnabled) && (
            <NavDropdown
              label={<FontAwesomeIcon icon={faNoteSticky as unknown as import('@fortawesome/fontawesome-svg-core').IconDefinition} size="lg" style={{ opacity: 0.5 }} />}
              activePath={location.pathname}
              bgColor={bgColor}
              light={light}
              items={[
                ...(ff.entertainmentEnabled ? [
                  { label: 'Music', to: '/entertainment/music' },
                  { label: 'Books', to: '/entertainment/books' },
                  { label: 'TV/Movies', to: '/entertainment/tv' },
                ] : []),
                ...(ff.inspirationEnabled ? [
                  { label: 'Research', to: '/inspiration/research' },
                  { label: 'Ideas', to: '/inspiration/ideas' },
                  { label: 'Quotes', to: '/inspiration/quotes' },
                ] : []),
              ]}
            />
          )}
          <NavLink to="/settings" $active={isActive('/settings')} $light={light} title="Settings"><FontAwesomeIcon icon={faSliders} size="lg" /></NavLink>
          <Divider />
          <LogoutButton $light={light} onClick={handleLogout} title="Logout">
            <FontAwesomeIcon icon={faArrowRightFromBracket} size="lg" />
          </LogoutButton>
        </Nav>

        <HamburgerButton onClick={() => setMobileMenuOpen(true)}>
          <FontAwesomeIcon icon={faBars} />
        </HamburgerButton>
      </HeaderBar>

      {/* Mobile drawer */}
      <MobileDrawerOverlay $open={mobileMenuOpen} onClick={() => setMobileMenuOpen(false)} />
      <MobileDrawer $open={mobileMenuOpen} $bgColor={bgColor}>
        <DrawerHeader>
          <DrawerCloseButton onClick={() => setMobileMenuOpen(false)}>
            <FontAwesomeIcon icon={faXmark} />
          </DrawerCloseButton>
        </DrawerHeader>
        <DrawerNav>
          {mobileNav('/', 'Journal')}
          {mobileNav('/topics', 'Topics')}
          {mobileNav('/calendar', 'Calendar')}
          {goalsItems.length > 0 && (
            <>
              <DrawerDivider />
              <DrawerSectionLabel onClick={() => toggleDrawerSection('planning')}>
                <span>Planner</span>
                <FontAwesomeIcon icon={drawerSections.planning ? faChevronUp : faChevronDown} size="xs" />
              </DrawerSectionLabel>
              {drawerSections.planning && (
                <>
                  {ff.goalsEnabled && mobileNav('/goals', 'Goals')}
                  {ff.milestonesEnabled && mobileNav('/goals/milestones', 'Milestones')}
                  {mobileNav('/goals/tasks', 'Tasks')}
                  {mobileNav('/goals/todos', 'Todos')}
                  {mobileNav('/menu', 'Menu Planner')}
                  {mobileNav('/shopping', 'Shopping Lists')}
                </>
              )}
            </>
          )}
          {healthItems.length > 0 && (
            <>
              <DrawerDivider />
              <DrawerSectionLabel onClick={() => toggleDrawerSection('health')}>
                <span>Health</span>
                <FontAwesomeIcon icon={drawerSections.health ? faChevronUp : faChevronDown} size="xs" />
              </DrawerSectionLabel>
              {drawerSections.health && (
                <>
                  {ff.medicationEnabled && mobileNav('/health/meds', 'Meds List')}
                  {ff.medicationEnabled && mobileNav('/health/schedule', 'Meds Schedule')}
                  {ff.foodEnabled && mobileNav('/health/food', 'Food')}
                  {ff.medicationEnabled && mobileNav('/health/symptoms', 'Symptoms')}
                  {ff.exerciseEnabled && mobileNav('/health/exercise', 'Exercise')}
                  {ff.allergiesEnabled && mobileNav('/health/allergies', 'Allergies')}
                  {mobileNav('/health/reporting', 'Reporting')}
                </>
              )}
            </>
          )}
          {(ff.entertainmentEnabled || ff.inspirationEnabled) && (
            <>
              <DrawerDivider />
              <DrawerSectionLabel onClick={() => toggleDrawerSection('quicklinks')}>
                <span>Quick Links</span>
                <FontAwesomeIcon icon={drawerSections.quicklinks ? faChevronUp : faChevronDown} size="xs" />
              </DrawerSectionLabel>
              {drawerSections.quicklinks && (
                <>
                  {ff.entertainmentEnabled && mobileNav('/entertainment/music', 'Music')}
                  {ff.entertainmentEnabled && mobileNav('/entertainment/books', 'Books')}
                  {ff.entertainmentEnabled && mobileNav('/entertainment/tv', 'TV/Movies')}
                  {ff.inspirationEnabled && mobileNav('/inspiration/research', 'Research')}
                  {ff.inspirationEnabled && mobileNav('/inspiration/ideas', 'Ideas')}
                  {ff.inspirationEnabled && mobileNav('/inspiration/quotes', 'Quotes')}
                </>
              )}
            </>
          )}
          <DrawerDivider />
          {mobileNav('/settings', 'Settings')}
          <DrawerDivider />
          <DrawerLogout onClick={handleLogout}>Logout</DrawerLogout>
        </DrawerNav>
      </MobileDrawer>
    </>
  );
}
