import { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { faPlus, faArrowRightFromBracket, faChevronDown, faBars, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useUIStore } from '../../stores/uiStore.js';
import { useEntriesStore } from '../../stores/entriesStore.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { useEncryption } from '../../contexts/EncryptionContext.js';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const HeaderBar = styled.header<{ $bgColor: string }>`
  display: flex;
  align-items: center;
  padding: 0 16px;
  height: 48px;
  background: ${({ $bgColor }) => $bgColor};
  color: rgba(255, 255, 255, 0.9);
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndex.header};
  font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
`;

const LogoImg = styled.img`
  height: 28px;
  width: auto;
  filter: brightness(0) invert(1);
`;

const NewEntryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.15s;

  &:hover { color: white; }
`;

const Divider = styled.div`
  width: 1px;
  height: 24px;
  background: rgba(255, 255, 255, 0.25);
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

const NavLink = styled(Link)<{ $active?: boolean }>`
  padding: 6px 14px;
  font-size: 14px;
  font-weight: ${({ $active }) => $active ? 700 : 500};
  color: ${({ $active }) => $active ? 'white' : 'rgba(255,255,255,0.7)'};
  text-decoration: none;
  transition: color 0.15s;
  white-space: nowrap;

  &:hover { color: white; }
`;

const DropdownWrapper = styled.div`
  position: relative;
`;

const DropdownTrigger = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  font-size: 14px;
  font-weight: ${({ $active }) => $active ? 700 : 500};
  color: ${({ $active }) => $active ? 'white' : 'rgba(255,255,255,0.7)'};
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.15s;
  white-space: nowrap;

  &:hover { color: white; }
`;

const DropdownChevron = styled.span`
  font-size: 9px;
  margin-left: 2px;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  min-width: 160px;
  padding: 4px 0;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  box-shadow: ${({ theme }) => theme.shadow.lg};
  animation: dropdownIn 0.15s ease-out;

  @keyframes dropdownIn {
    from { opacity: 0; transform: translateY(-4px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const DropdownItem = styled(Link)`
  display: block;
  padding: 8px 16px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  transition: background 0.1s;

  &:hover {
    background: rgba(0, 0, 0, 0.04);
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255,255,255,0.7);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.15s;

  &:hover { color: white; }
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
  font-size: 15px;
  font-weight: ${({ $active }) => $active ? 700 : 500};
  color: ${({ $active }) => $active ? 'white' : 'rgba(255,255,255,0.75)'};
  text-decoration: none;
  transition: background 0.1s;

  &:hover { background: rgba(255,255,255,0.1); }
`;

const DrawerSectionLabel = styled.div`
  padding: 16px 20px 6px;
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.45);
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const DrawerDivider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.15);
  margin: 4px 0;
`;

const DrawerLogout = styled.button`
  display: block;
  width: 100%;
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.75);
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;

  &:hover { background: rgba(255,255,255,0.1); }
`;

interface NavDropdownProps {
  label: string;
  items: { label: string; to: string }[];
  activePath: string;
}

function NavDropdown({ label, items, activePath }: NavDropdownProps) {
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
      <DropdownTrigger $active={isActive || open} onClick={() => open ? closeMenu() : setOpen(true)}>
        {label}
        <DropdownChevron style={{ transform: open && !closing ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
          <FontAwesomeIcon icon={faChevronDown} />
        </DropdownChevron>
      </DropdownTrigger>
      {open && (
        <DropdownMenu style={closing ? { opacity: 0, transform: 'translateY(-4px)', transition: 'opacity 0.15s, transform 0.15s' } : undefined}>
          {items.map(item => (
            <DropdownItem key={item.to} to={item.to} onClick={() => { closeMenu(); }}>
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

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    lock();
    await logout();
    navigate('/login');
  };

  const handleNewEntry = () => {
    useUIStore.getState().setSelectedEntryId(null);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;
  const bgColor = headerColor || '#0F4C5C';

  // Feature-gated nav items
  const ff = featureFlags;
  // Goals dropdown items — each gated by its own flag
  const goalsItems: { label: string; to: string }[] = [];
  if (ff.goalsEnabled) goalsItems.push({ label: 'Goals', to: '/goals' });
  if (ff.milestonesEnabled) goalsItems.push({ label: 'Milestones', to: '/goals/milestones' });

  const healthItems: { label: string; to: string }[] = [];
  if (ff.medicationEnabled) {
    healthItems.push({ label: 'Meds List', to: '/health/meds' });
    healthItems.push({ label: 'Meds Schedule', to: '/health/schedule' });
  }
  if (ff.foodEnabled) healthItems.push({ label: 'Food', to: '/health/food' });
  if (ff.medicationEnabled) healthItems.push({ label: 'Symptoms', to: '/health/symptoms' });
  if (ff.exerciseEnabled) healthItems.push({ label: 'Exercise', to: '/health/exercise' });
  if (healthItems.length > 0) healthItems.push({ label: 'Reporting', to: '/health/reporting' });

  const mobileNav = (to: string, label: string) => (
    <DrawerLink to={to} $active={isActive(to)} onClick={() => setMobileMenuOpen(false)}>
      {label}
    </DrawerLink>
  );

  return (
    <>
      <HeaderBar $bgColor={bgColor}>
        <LeftSection>
          <Logo to="/">
            <LogoImg src="/chronicles-logo.png" alt="Chronicles" />
          </Logo>
          <Divider />
          <NewEntryButton onClick={handleNewEntry}>
            <FontAwesomeIcon icon={faPlus} size="sm" />
            New Entry
          </NewEntryButton>
        </LeftSection>

        <Nav>
          <NavLink to="/" $active={isActive('/')}>Journal</NavLink>
          <NavLink to="/calendar" $active={isActive('/calendar')}>Calendar</NavLink>
          {goalsItems.length > 0 && (
            <NavDropdown
              label="Goals"
              activePath={location.pathname}
              items={goalsItems}
            />
          )}

          {healthItems.length > 0 && (
            <NavDropdown
              label="Health"
              activePath={location.pathname}
              items={healthItems}
            />
          )}

          <NavDropdown
            label="Entertainment"
            activePath={location.pathname}
            items={[
              { label: 'Music', to: '/entertainment/music' },
              { label: 'Books', to: '/entertainment/books' },
              { label: 'TV/Movies', to: '/entertainment/tv' },
            ]}
          />

          <NavDropdown
            label="Inspiration"
            activePath={location.pathname}
            items={[
              { label: 'Research', to: '/inspiration/research' },
              { label: 'Ideas', to: '/inspiration/ideas' },
              { label: 'Quotes', to: '/inspiration/quotes' },
            ]}
          />

          <NavLink to="/topics" $active={isActive('/topics')}>Topics</NavLink>
          <NavLink to="/settings" $active={isActive('/settings')}>Settings</NavLink>
          <Divider />
          <LogoutButton onClick={handleLogout}>
            Logout
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
          {mobileNav('/calendar', 'Calendar')}
          {goalsItems.length > 0 && (
            <>
              <DrawerDivider />
              <DrawerSectionLabel>Goals</DrawerSectionLabel>
              {ff.goalsEnabled && mobileNav('/goals', 'Goals')}
              {ff.milestonesEnabled && mobileNav('/goals/milestones', 'Milestones')}
            </>
          )}
          {healthItems.length > 0 && (
            <>
              <DrawerDivider />
              <DrawerSectionLabel>Health</DrawerSectionLabel>
              {ff.medicationEnabled && mobileNav('/health/meds', 'Meds List')}
              {ff.medicationEnabled && mobileNav('/health/schedule', 'Meds Schedule')}
              {ff.foodEnabled && mobileNav('/health/food', 'Food')}
              {ff.medicationEnabled && mobileNav('/health/symptoms', 'Symptoms')}
              {ff.exerciseEnabled && mobileNav('/health/exercise', 'Exercise')}
              {mobileNav('/health/reporting', 'Reporting')}
            </>
          )}
          <DrawerDivider />
          <DrawerSectionLabel>Entertainment</DrawerSectionLabel>
          {mobileNav('/entertainment/music', 'Music')}
          {mobileNav('/entertainment/books', 'Books')}
          {mobileNav('/entertainment/tv', 'TV/Movies')}
          <DrawerDivider />
          <DrawerSectionLabel>Inspiration</DrawerSectionLabel>
          {mobileNav('/inspiration/research', 'Research')}
          {mobileNav('/inspiration/ideas', 'Ideas')}
          {mobileNav('/inspiration/quotes', 'Quotes')}
          <DrawerDivider />
          {mobileNav('/topics', 'Topics')}
          {mobileNav('/settings', 'Settings')}
          <DrawerDivider />
          <DrawerLogout onClick={handleLogout}>Logout</DrawerLogout>
        </DrawerNav>
      </MobileDrawer>
    </>
  );
}
