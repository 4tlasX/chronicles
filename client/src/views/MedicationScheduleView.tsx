import styled from 'styled-components';
import { ContentTemplate } from '../components/templates/ContentTemplate.js';
import { EmptyState } from '../components/atoms/EmptyState.js';
import { Spinner } from '../components/atoms/Spinner.js';
import { PrintButton } from '../components/atoms/PrintButton.js';
import { UnlockDialog } from '../components/organisms/UnlockDialog.js';
import { MedicationSchedule } from '../components/organisms/MedicationSchedule.js';
import { HealthTabBar } from '../components/molecules/HealthTabBar.js';
import { useInitializeData } from '../hooks/useInitializeData.js';

/* ── Layout (mirrors HealthView) ── */

const Page = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const Inner = styled.div`
  width: 100%;
  max-width: 1150px;
  margin: 0 auto;
  padding: 0 24px 64px;
  @media (max-width: 768px) { padding: 0 16px 48px; }
`;

const Head = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding: 53px 0 16px;
`;

const Title = styled.h1`
  font-family: var(--font-display);
  font-size: 44px;
  font-weight: 200;
  line-height: 1;
  color: var(--text-primary);
  margin: 0;
  @media (max-width: 480px) { font-size: 34px; }
`;

const TabsRow = styled.div`
  margin: 0;
`;

const Body = styled.div`
  padding-top: 8px;
`;

/* ── View ── */

export function MedicationScheduleView() {
  const { isReady, isLoading, needsUnlock, handleUnlock } = useInitializeData();

  if (needsUnlock) return (<><ContentTemplate><EmptyState message="Unlock your journal to view schedule" /></ContentTemplate><UnlockDialog onUnlock={handleUnlock} /></>);
  if (isLoading || !isReady) return (<ContentTemplate><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}><Spinner size={40} /></div></ContentTemplate>);

  return (
    <ContentTemplate>
      <Page>
        <Inner>
          <Head>
            <Title>Health</Title>
            <div data-print-hide><PrintButton /></div>
          </Head>
          <TabsRow data-print-hide><HealthTabBar /></TabsRow>
          <Body>
            <MedicationSchedule isReady={isReady} />
          </Body>
        </Inner>
      </Page>
    </ContentTemplate>
  );
}
