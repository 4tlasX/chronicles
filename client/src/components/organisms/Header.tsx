import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { faPlus, faArrowRightFromBracket, faBars, faXmark, faHome, faBookOpen, faCalendar, faTag, faGear, faMagnifyingGlass, faFlag, faCheck, faCircleCheck, faLayerGroup, faSlidersH, faPills, faCalendarCheck, faUtensils, faThermometerHalf, faPersonRunning, faTriangleExclamation, faChartLine, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { UserCircle } from '@phosphor-icons/react';
import { faNoteSticky } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { useUIStore } from '../../stores/uiStore.js';
import { useEntriesStore } from '../../stores/entriesStore.js';
import { getTopicIcon } from '../../utils/topicIcons.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { useEncryption } from '../../contexts/EncryptionContext.js';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { HeaderBar } from '../atoms/HeaderBar.js';
import { InlineWeather } from '../molecules/InlineWeather.js';

function isLightColor(hex: string): boolean {
  if (hex === 'transparent') return false;
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.75;
}


const Logo = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  flex-shrink: 0;

  @media (max-width: 1366px) {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    pointer-events: auto;
  }
`;

const LogoText = styled.span<{ $light?: boolean }>`
  display: flex;
  align-items: center;
  font-family: 'Lato', sans-serif;
  font-size: 18px;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: ${({ $light }) => $light ? 'rgba(0,0,0,0.85)' : '#f0ebdf'};
  @media (max-width: 480px) { font-size: 16px; }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  flex-shrink: 0;
  margin-left: auto;

  @media (max-width: 1366px) { display: none; }
`;

const DateText = styled.span<{ $light?: boolean }>`
  font-family: 'Lato', sans-serif;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${({ $light }) => $light ? 'rgba(0,0,0,0.7)' : '#f0ebdf'};
  opacity: 0.85;
  white-space: nowrap;

  @media (max-width: 900px) { display: none; }
`;

const HeaderIconBtn = styled.button<{ $light?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  width: 20px;
  height: 20px;
  font-size: 14px;
  color: ${({ $light }) => $light ? 'rgba(0,0,0,0.7)' : '#f0ebdf'};
  background: none;
  border: none;
  cursor: pointer;
  transition: opacity 0.15s;
  opacity: 0.85;

  &:hover { opacity: 1; }

  @media (max-width: 1366px) { display: none; }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 20px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);

  @media (max-width: 1366px) {
    display: none;
  }
`;

const NavDropdownWrap = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;

  &:hover > .nav-dd-menu,
  &:focus-within > .nav-dd-menu {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }
`;

const NavDropdownTrigger = styled.button<{ $active?: boolean; $light?: boolean }>`
  padding: 4px 0;
  font-family: 'Lato', sans-serif;
  font-size: 11px;
  font-weight: ${({ $active }) => $active ? 900 : 600};
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: ${({ $light }) => $light ? 'rgba(0,0,0,0.85)' : '#f0ebdf'};
  opacity: ${({ $active }) => $active ? 1 : 0.8};
  background: none;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  transition: opacity 0.15s;
  &:hover { opacity: 1; }
`;

const NavDropdownMenu = styled.div<{ $bgColor: string; $light?: boolean }>`
  position: absolute;
  top: 100%;
  left: -10px;
  transform: translateY(-6px);
  /* Top padding bridges the gap to the trigger so the menu stays open while moving cursor */
  padding-top: 14px;
  min-width: 220px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 140ms ease, transform 140ms ease;
  z-index: 100;

  & > .nav-dd-menu-inner {
    background: ${({ $bgColor }) => $bgColor};
    color: ${({ $light }) => $light ? 'rgba(0,0,0,0.9)' : '#f0ebdf'};
    border-radius: 4px;
    padding: 8px 0;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  }
`;

const NavDropdownItem = styled(Link)<{ $active?: boolean; $light?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 18px;
  font-family: 'Lato', sans-serif;
  font-size: 11px;
  font-weight: ${({ $active }) => $active ? 900 : 600};
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: ${({ $light }) => $light ? 'rgba(0,0,0,0.9)' : '#f0ebdf'};
  text-decoration: none;
  white-space: nowrap;
  transition: background 120ms ease;

  &:hover { background: ${({ $light }) => $light ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)'}; }

  & svg { width: 14px; opacity: 0.75; }
`;

const NavLink = styled(Link)<{ $active?: boolean; $light?: boolean }>`
  padding: 4px 0;
  font-family: 'Lato', sans-serif;
  font-size: 11px;
  font-weight: ${({ $active }) => $active ? 900 : 600};
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: ${({ $light }) => $light ? 'rgba(0,0,0,0.85)' : '#f0ebdf'};
  opacity: ${({ $active }) => $active ? 1 : 0.8};
  text-decoration: none;
  transition: opacity 0.15s;
  white-space: nowrap;

  &:hover {
    opacity: 1;
  }
`;


const AvatarWrapper = styled.div`
  position: relative;
`;

const Avatar = styled.button<{ $light?: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: var(--r-sm, 2px);
  border: 1px solid ${({ $light }) => $light ? 'rgba(0,0,0,0.25)' : 'rgba(240,235,223,0.35)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--sans);
  font-size: 12px;
  font-weight: 700;
  color: ${({ $light }) => $light ? 'rgba(0,0,0,0.7)' : '#f0ebdf'};
  background: none;
  cursor: pointer;
  flex-shrink: 0;
  user-select: none;
  transition: opacity 0.15s;

  &:hover { opacity: 0.8; }
`;

const AvatarMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 160px;
  background: var(--paper-surface);
  border: 1px solid var(--rule);
  border-radius: var(--r-md, 4px);
  box-shadow: var(--shadow-3, 0 4px 12px rgba(0,0,0,0.12));
  overflow: hidden;
  z-index: 200;
  animation: dropIn 0.12s ease-out;

  @keyframes dropIn {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

const AvatarMenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  font-family: var(--sans);
  font-size: 13px;
  color: var(--ink-2);
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s, color 0.1s;

  &:hover { background: var(--paper-hover); color: var(--ink); }
`;

const MobileAvatarWrapper = styled.div`
  display: none;
  position: relative;
  margin-left: auto;
  flex-shrink: 0;

  @media (max-width: 1366px) {
    display: flex;
    align-items: center;
  }
`;

const MobileAvatarIconBtn = styled.button<{ $light?: boolean }>`
  width: 36px;
  height: 36px;
  border: 0;
  background: transparent;
  color: ${({ $light }) => $light ? 'rgba(0,0,0,0.7)' : '#f0ebdf'};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  line-height: 1;
  padding: 0;

  &:hover { background: rgba(255,255,255,0.08); }
`;

const HamburgerButton = styled.button<{ $light?: boolean }>`
  display: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: ${({ $light }) => $light ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)'};
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  flex-shrink: 0;

  @media (max-width: 1366px) {
    display: flex;
  }
`;


const MobileDrawerOverlay = styled.div<{ $open: boolean }>`
  display: none;
  position: fixed;
  inset: 0;
  z-index: ${({ theme }) => theme.zIndex.modal};
  background: rgba(43, 40, 36, 0.42);
  backdrop-filter: blur(2px);
  opacity: ${({ $open }) => $open ? 1 : 0};
  transition: opacity 0.25s ease;
  pointer-events: ${({ $open }) => $open ? 'auto' : 'none'};

  @media (max-width: 1366px) {
    display: block;
  }
`;

const MobileDrawer = styled.div<{ $open: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 82%;
  max-width: 320px;
  height: 100vh;
  z-index: ${({ theme }) => theme.zIndex.modal + 1};
  background: var(--paper-surface);
  box-shadow: 6px 0 24px rgba(0,0,0,0.18);
  transform: translateX(${({ $open }) => $open ? '0' : '-100%'});
  transition: transform 0.25s ease;
  display: none;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 1366px) {
    display: flex;
  }
`;

const DrawerHead = styled.div<{ $bgColor: string }>`
  background: ${({ $bgColor }) => $bgColor};
  color: var(--h-active-ink, #f0ebdf);
  padding: 40px 16px 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-shrink: 0;
`;

const DrawerGreeting = styled.div`
  font-family: var(--serif);
  font-style: italic;
  font-size: 13px;
  color: var(--h-active-ink, #f0ebdf);
  opacity: 0.75;
  margin-bottom: 2px;
`;

const DrawerUserName = styled.div`
  font-family: var(--serif);
  font-size: 20px;
  font-weight: 500;
  color: var(--h-active-ink, #f0ebdf);
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
  color: var(--h-active-ink, rgba(255,255,255,0.9));
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
`;

const DrawerNav = styled.nav`
  flex: 1;
  overflow-y: auto;
  padding: 10px 8px;
  display: flex;
  flex-direction: column;
`;

const DrawerLink = styled(Link)<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 12px;
  border-radius: var(--r-sm, 2px);
  font-family: var(--sans);
  font-size: 14px;
  font-weight: ${({ $active }) => $active ? 700 : 400};
  color: ${({ $active }) => $active ? 'var(--ink)' : 'var(--ink-2)'};
  text-decoration: none;
  border-left: ${({ $active }) => $active ? '2px solid var(--accent-stroke)' : '2px solid transparent'};
  padding-left: ${({ $active }) => $active ? '10px' : '12px'};
  background: ${({ $active }) => $active ? 'var(--paper-hover)' : 'transparent'};
  min-height: 44px;
  transition: background 0.1s;

  &:hover { background: var(--paper-hover); }
`;

const DrawerLinkIcon = styled.span`
  font-size: 16px;
  color: var(--ink-3);
  flex: 0 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DrawerSectionLabel = styled.div`
  font-family: var(--mono);
  font-size: 9px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ink-4);
  padding: 14px 12px 6px;
  border-top: 1px dashed var(--rule);
  margin-top: 10px;
`;


const DrawerCount = styled.span`
  margin-left: auto;
  font-family: var(--mono);
  font-size: 10px;
  color: var(--ink-4);
  letter-spacing: 0.08em;
`;

const DrawerDivider = styled.div`
  height: 1px;
  background: var(--rule);
  margin: 4px 0;
`;

const DrawerFoot = styled.footer`
  padding: 12px 8px;
  border-top: 1px solid var(--rule);
  flex-shrink: 0;
`;

const DrawerLogout = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border-radius: var(--r-sm, 2px);
  font-family: var(--sans);
  font-size: 14px;
  color: var(--ink-3);
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s, color 0.1s;

  &:hover {
    background: var(--paper-hover);
    color: var(--ink);
  }
`;


function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning,';
  if (h < 17) return 'Good afternoon,';
  return 'Good evening,';
}

function formatHeaderDate(): string {
  const now = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return `${days[now.getDay()]} · ${now.getDate()} ${months[now.getMonth()]}`;
}

export function Header() {
  const headerColor = useUIStore(s => s.headerColor);
  const displayName = useUIStore(s => s.displayName);
  const featureFlags = useEntriesStore(s => s.featureFlags);
  const topics = useEntriesStore(s => s.topics);
  const entries = useEntriesStore(s => s.decryptedEntries);
  const { logout } = useAuth();
  const { lock } = useEncryption();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [mobileAvatarMenuOpen, setMobileAvatarMenuOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const mobileAvatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!avatarMenuOpen) return;
    const handle = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarMenuOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [avatarMenuOpen]);

  useEffect(() => {
    if (!mobileAvatarMenuOpen) return;
    const handle = (e: MouseEvent) => {
      if (mobileAvatarRef.current && !mobileAvatarRef.current.contains(e.target as Node)) setMobileAvatarMenuOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [mobileAvatarMenuOpen]);

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    setAvatarMenuOpen(false);
    lock();
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;
  const themeMode = useUIStore(s => s.themeMode);
  const bgColor = headerColor || '#6A9B9B';
  const light = isLightColor(bgColor);
  const userInitial = (displayName || 'J')[0].toUpperCase();

  const countForTopic = (topicId: number) =>
    entries.filter(e => (e.metadata as Record<string, unknown>)?._taxonomyId === topicId).length;

  const ff = featureFlags;

  const healthItems: { label: string; to: string }[] = [];
  if (ff.medicationEnabled) {
    healthItems.push({ label: 'Meds List', to: '/health/meds' });
    healthItems.push({ label: 'Meds Schedule', to: '/health/schedule' });
  }
  if (ff.foodEnabled) healthItems.push({ label: 'Meals', to: '/health/food' });
  if (ff.medicationEnabled) healthItems.push({ label: 'Symptoms', to: '/health/symptoms' });
  if (ff.exerciseEnabled) healthItems.push({ label: 'Exercise', to: '/health/exercise' });
  if (ff.allergiesEnabled) healthItems.push({ label: 'Allergies', to: '/health/allergies' });
  if (healthItems.length > 0) healthItems.push({ label: 'Reporting', to: '/health/reporting' });

  const mobileNav = (to: string, label: string, icon?: IconDefinition, iconNode?: React.ReactNode) => (
    <DrawerLink key={to} to={to} $active={isActive(to)} onClick={() => setMobileMenuOpen(false)}>
      <DrawerLinkIcon>{iconNode ?? (icon && <FontAwesomeIcon icon={icon} />)}</DrawerLinkIcon>
      {label}
    </DrawerLink>
  );

  const logoEl = (
    <Logo to="/" onClick={() => {
      useUIStore.getState().setViewMode('all');
      useUIStore.getState().setSelectedTopicId(null);
      useUIStore.getState().setSelectedEntryId(null);
      useUIStore.getState().setShowMobileEditor(false);
    }}>
      <LogoText $light={light}>Chronicles</LogoText>
    </Logo>
  );

  const planningItems = [
    ff.goalsEnabled && { to: '/goals', label: 'Goals', icon: faFlag },
    ff.goalsEnabled && { to: '/goals/milestones', label: 'Milestones', icon: faLayerGroup },
    { to: '/goals/tasks', label: 'Tasks', icon: faCheck },
    { to: '/goals/todos', label: 'Todos', icon: faCircleCheck },
    { to: '/goals/filter', label: 'Planner Filter', icon: faSlidersH },
  ].filter(Boolean) as { to: string; label: string; icon: IconDefinition }[];

  const healthDropdownItems = [
    ff.medicationEnabled && { to: '/health/schedule', label: 'Med Schedule', icon: faCalendarCheck },
    ff.medicationEnabled && { to: '/health/meds', label: 'Medications', icon: faPills },
    ff.foodEnabled && { to: '/health/food', label: 'Meals', icon: faUtensils },
    { to: '/health/symptoms', label: 'Symptoms', icon: faThermometerHalf },
    ff.exerciseEnabled && { to: '/health/exercise', label: 'Exercise', icon: faPersonRunning },
    ff.allergiesEnabled && { to: '/health/allergies', label: 'Allergies', icon: faTriangleExclamation },
    { to: '/health/reporting', label: 'Reports', icon: faChartLine },
  ].filter(Boolean) as { to: string; label: string; icon: IconDefinition }[];

  const centerNav = (
    <Nav>
      <NavLink to="/" $active={isActive('/')} $light={light}>Dashboard</NavLink>
      <NavLink to="/journal" $active={isActive('/journal')} $light={light}>Journal</NavLink>
      <NavLink to="/topics" $active={isActive('/topics')} $light={light}>Topics</NavLink>
      <NavLink to="/calendar" $active={isActive('/calendar')} $light={light}>Calendar</NavLink>
      <NavDropdownWrap>
        <NavDropdownTrigger $active={location.pathname.startsWith('/goals')} $light={light}>
          Planning <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: 8 }} />
        </NavDropdownTrigger>
        <NavDropdownMenu className="nav-dd-menu" $bgColor={bgColor} $light={light}>
          <div className="nav-dd-menu-inner">
            {planningItems.map(item => (
              <NavDropdownItem key={item.to} to={item.to} $active={location.pathname === item.to} $light={light}>
                {item.label}
              </NavDropdownItem>
            ))}
          </div>
        </NavDropdownMenu>
      </NavDropdownWrap>
      {healthDropdownItems.length > 0 && (
        <NavDropdownWrap>
          <NavDropdownTrigger $active={location.pathname.startsWith('/health')} $light={light}>
            Health <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: 8 }} />
          </NavDropdownTrigger>
          <NavDropdownMenu className="nav-dd-menu" $bgColor={bgColor} $light={light}>
            <div className="nav-dd-menu-inner">
              {healthDropdownItems.map(item => (
                <NavDropdownItem key={item.to} to={item.to} $active={location.pathname === item.to} $light={light}>
                  {item.label}
                </NavDropdownItem>
              ))}
            </div>
          </NavDropdownMenu>
        </NavDropdownWrap>
      )}
    </Nav>
  );

  const rightEl = (
    <RightSection>
      <DateText $light={light}>{formatHeaderDate()}</DateText>
      <InlineWeather $light={light} />
      <HeaderIconBtn $light={light} title="Search" onClick={() => navigate('/journal')}>
        <FontAwesomeIcon icon={faMagnifyingGlass} />
      </HeaderIconBtn>
      <Link to="/settings" style={{ display: 'flex' }}>
        <HeaderIconBtn $light={light} title="Settings">
          <FontAwesomeIcon icon={faGear} />
        </HeaderIconBtn>
      </Link>
      <AvatarWrapper ref={avatarRef}>
        <Avatar $light={light} title="Account" onClick={() => setAvatarMenuOpen(v => !v)}>
          {userInitial}
        </Avatar>
        {avatarMenuOpen && (
          <AvatarMenu>
            <AvatarMenuItem onClick={() => { setAvatarMenuOpen(false); navigate('/settings'); }}>
              <FontAwesomeIcon icon={faGear} />
              Settings
            </AvatarMenuItem>
            <AvatarMenuItem onClick={handleLogout}>
              <FontAwesomeIcon icon={faArrowRightFromBracket} />
              Logout
            </AvatarMenuItem>
          </AvatarMenu>
        )}
      </AvatarWrapper>
    </RightSection>
  );

  return (
    <>
      <HeaderBar accentColor={bgColor} dark={themeMode === 'dark'} height={56}>
        {/* Mobile: leftmost — hidden on desktop */}
        <HamburgerButton $light={light} onClick={() => setMobileMenuOpen(true)}>
          <FontAwesomeIcon icon={faBars} />
        </HamburgerButton>

        {/* Logo — left on desktop, absolute-centered on mobile */}
        {logoEl}

        {/* Desktop center nav */}
        {centerNav}

        {/* Mobile avatar — right of header, hidden on desktop */}
        <MobileAvatarWrapper ref={mobileAvatarRef}>
          <MobileAvatarIconBtn $light={light} onClick={() => setMobileAvatarMenuOpen(v => !v)}>
            <UserCircle size={28} weight="fill" />
          </MobileAvatarIconBtn>
          {mobileAvatarMenuOpen && (
            <AvatarMenu>
              <AvatarMenuItem onClick={() => { setMobileAvatarMenuOpen(false); navigate('/settings'); }}>
                <FontAwesomeIcon icon={faGear} />
                Settings
              </AvatarMenuItem>
              <AvatarMenuItem onClick={() => { setMobileAvatarMenuOpen(false); handleLogout(); }}>
                <FontAwesomeIcon icon={faArrowRightFromBracket} />
                Logout
              </AvatarMenuItem>
            </AvatarMenu>
          )}
        </MobileAvatarWrapper>

        {/* Desktop right section */}
        {rightEl}
      </HeaderBar>

      {/* Mobile drawer — slides from left */}
      <MobileDrawerOverlay $open={mobileMenuOpen} onClick={() => setMobileMenuOpen(false)} />
      <MobileDrawer $open={mobileMenuOpen}>
        <DrawerHead $bgColor={bgColor}>
          <div>
            <DrawerGreeting>{getGreeting()}</DrawerGreeting>
            <DrawerUserName>{displayName || 'Chronicles'}</DrawerUserName>
          </div>
          <DrawerCloseButton onClick={() => setMobileMenuOpen(false)}>
            <FontAwesomeIcon icon={faXmark} />
          </DrawerCloseButton>
        </DrawerHead>

        <DrawerNav>
          {mobileNav('/', 'Dashboard', faHome)}
          {mobileNav('/journal', 'Journal', faBookOpen)}
          {mobileNav('/calendar', 'Calendar', faCalendar)}
          {mobileNav('/topics', 'Topics', faTag)}

          <DrawerSectionLabel>Planning</DrawerSectionLabel>
          {ff.goalsEnabled && mobileNav('/goals', 'Goals', faFlag)}
          {ff.goalsEnabled && mobileNav('/goals/milestones', 'Milestones', faLayerGroup)}
          {mobileNav('/goals/tasks', 'Tasks', faCheck)}
          {mobileNav('/goals/todos', 'Todos', faCircleCheck)}
          {mobileNav('/goals/filter', 'Planner Filter', faSlidersH)}

          {healthItems.length > 0 && (
            <>
              <DrawerSectionLabel>Health</DrawerSectionLabel>
              {ff.medicationEnabled && mobileNav('/health/schedule', 'Med Schedule', faCalendarCheck)}
              {ff.medicationEnabled && mobileNav('/health/meds', 'Medications', faPills)}
              {ff.foodEnabled && mobileNav('/health/food', 'Meals', faUtensils)}
              {mobileNav('/health/symptoms', 'Symptoms', faThermometerHalf)}
              {ff.exerciseEnabled && mobileNav('/health/exercise', 'Exercise', faPersonRunning)}
              {ff.allergiesEnabled && mobileNav('/health/allergies', 'Allergies', faTriangleExclamation)}
              {mobileNav('/health/reporting', 'Reports', faChartLine)}
            </>
          )}

          {(ff.entertainmentEnabled || ff.inspirationEnabled) && (
            <>
              <DrawerSectionLabel>Inspiration</DrawerSectionLabel>
              {ff.inspirationEnabled && mobileNav('/inspiration/quotes', 'Quotes')}
              {ff.inspirationEnabled && mobileNav('/inspiration/ideas', 'Ideas')}
              {ff.entertainmentEnabled && mobileNav('/entertainment/music', 'Music')}
              {ff.entertainmentEnabled && mobileNav('/entertainment/books', 'Books')}
              {ff.entertainmentEnabled && mobileNav('/entertainment/tv', 'TV/Movies')}
            </>
          )}


          {topics.length > 0 && (
            <>
              <DrawerSectionLabel>Your Topics</DrawerSectionLabel>
              {topics.map(topic => {
                const count = countForTopic(topic.id);
                return (
                  <DrawerLink
                    key={topic.id}
                    to="/journal"
                    $active={isActive('/journal') && useUIStore.getState().selectedTopicId === topic.id}
                    onClick={() => {
                      useUIStore.getState().setSelectedTopicId(topic.id);
                      useUIStore.getState().setViewMode('all');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <DrawerLinkIcon><FontAwesomeIcon icon={getTopicIcon(topic.icon)} /></DrawerLinkIcon>
                    <span style={{ flex: 1 }}>{topic.name}</span>
                    {count > 0 && <DrawerCount>{count.toLocaleString()}</DrawerCount>}
                  </DrawerLink>
                );
              })}
              <DrawerLink to="/topics" onClick={() => setMobileMenuOpen(false)}>
                <DrawerLinkIcon><FontAwesomeIcon icon={faPlus} /></DrawerLinkIcon>
                Add topic…
              </DrawerLink>
            </>
          )}

          <DrawerSectionLabel>Settings</DrawerSectionLabel>
          {mobileNav('/settings', 'Preferences', faGear)}
        </DrawerNav>

        <DrawerFoot>
          <DrawerLogout onClick={handleLogout}>
            <FontAwesomeIcon icon={faArrowRightFromBracket} />
            Logout
          </DrawerLogout>
        </DrawerFoot>
      </MobileDrawer>
    </>
  );
}
