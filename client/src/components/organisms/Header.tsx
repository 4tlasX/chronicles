import styled from 'styled-components';

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--s-7, 32px);
  height: 44px;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-app);
  flex-shrink: 0;
`;

export function Header() {

  return (
    <TopBar>
    </TopBar>
  );
}
