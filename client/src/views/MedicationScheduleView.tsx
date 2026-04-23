import { ContentTemplate } from '../components/templates/ContentTemplate.js';
import { EmptyState } from '../components/atoms/EmptyState.js';
import { Spinner } from '../components/atoms/Spinner.js';
import { ViewHeader } from '../components/molecules/ViewHeader.js';
import { PrintButton } from '../components/atoms/PrintButton.js';
import { UnlockDialog } from '../components/organisms/UnlockDialog.js';
import { MedicationSchedule } from '../components/organisms/MedicationSchedule.js';
import { HealthTabBar } from '../components/molecules/HealthTabBar.js';
import { useInitializeData } from '../hooks/useInitializeData.js';

/* ── View ── */

export function MedicationScheduleView() {
  const { isReady, isLoading, needsUnlock, handleUnlock } = useInitializeData();

  if (needsUnlock) return (<><ContentTemplate><EmptyState message="Unlock your journal to view schedule" /></ContentTemplate><UnlockDialog onUnlock={handleUnlock} /></>);
  if (isLoading || !isReady) return (<ContentTemplate><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}><Spinner size={40} /></div></ContentTemplate>);

  return (
    <ContentTemplate>
      <ViewHeader title="Medication Schedule" titleTo="/health" right={<PrintButton />} />
      <HealthTabBar />
      <MedicationSchedule isReady={isReady} />
    </ContentTemplate>
  );
}
