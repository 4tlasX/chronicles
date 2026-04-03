import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithTheme } from '../testUtils';

import { SeverityTrendChart } from '@/components/molecules/charts/SeverityTrendChart';
import { FrequencyChart } from '@/components/molecules/charts/FrequencyChart';
import { CorrelationChart } from '@/components/molecules/charts/CorrelationChart';

import type { SeverityTrendData, FrequencyData, CorrelationResult } from '@/utils/correlationAnalysis';

/* ═══════════════════════ SeverityTrendChart ═══════════════════════ */

describe('SeverityTrendChart', () => {
  const sampleData: SeverityTrendData[] = [
    { date: '2024-06-01', avgSeverity: 3, maxSeverity: 5 },
    { date: '2024-06-02', avgSeverity: 7, maxSeverity: 9 },
    { date: '2024-06-03', avgSeverity: 5, maxSeverity: 6 },
  ];

  it('renders the title', () => {
    renderWithTheme(<SeverityTrendChart data={sampleData} title="Headache Severity" />);
    expect(screen.getByText('Headache Severity')).toBeInTheDocument();
  });

  it('shows empty state when data is empty', () => {
    renderWithTheme(<SeverityTrendChart data={[]} title="No Data" />);
    expect(screen.getByText('No severity data available')).toBeInTheDocument();
  });

  it('renders SVG chart elements when data is provided', () => {
    const { container } = renderWithTheme(<SeverityTrendChart data={sampleData} title="Trend" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    // Should have circles for each data point
    const circles = svg!.querySelectorAll('circle');
    expect(circles).toHaveLength(sampleData.length);
  });

  it('renders legend items', () => {
    renderWithTheme(<SeverityTrendChart data={sampleData} title="Trend" />);
    expect(screen.getByText('Mild (1-3)')).toBeInTheDocument();
    expect(screen.getByText('Moderate (4-6)')).toBeInTheDocument();
    expect(screen.getByText('Severe (7-10)')).toBeInTheDocument();
  });

  it('renders X-axis date labels', () => {
    renderWithTheme(<SeverityTrendChart data={sampleData} title="Trend" />);
    expect(screen.getByText('6/1')).toBeInTheDocument();
    expect(screen.getByText('6/2')).toBeInTheDocument();
    expect(screen.getByText('6/3')).toBeInTheDocument();
  });

  it('renders Y-axis labels', () => {
    renderWithTheme(<SeverityTrendChart data={sampleData} title="Trend" />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});

/* ═══════════════════════ FrequencyChart ═══════════════════════ */

describe('FrequencyChart', () => {
  const sampleData: FrequencyData[] = [
    { period: '2024-06-01', count: 3 },
    { period: '2024-06-02', count: 7 },
    { period: '2024-06-03', count: 5 },
  ];

  it('renders the title', () => {
    renderWithTheme(<FrequencyChart data={sampleData} title="Exercise Frequency" color="#4281a4" />);
    expect(screen.getByText('Exercise Frequency')).toBeInTheDocument();
  });

  it('shows empty state when data is empty', () => {
    renderWithTheme(<FrequencyChart data={[]} title="No Data" color="#4281a4" />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('renders bars for each data point', () => {
    const { container } = renderWithTheme(
      <FrequencyChart data={sampleData} title="Frequency" color="#4281a4" />,
    );
    // Each bar column has a title attribute with the count
    const barCols = container.querySelectorAll('[title]');
    expect(barCols.length).toBeGreaterThanOrEqual(sampleData.length);
  });

  it('renders period labels', () => {
    renderWithTheme(<FrequencyChart data={sampleData} title="Frequency" color="#4281a4" />);
    expect(screen.getByText('6/1')).toBeInTheDocument();
    expect(screen.getByText('6/2')).toBeInTheDocument();
    expect(screen.getByText('6/3')).toBeInTheDocument();
  });

  it('limits to last 12 data points', () => {
    const manyPoints: FrequencyData[] = Array.from({ length: 20 }, (_, i) => ({
      period: `2024-06-${String(i + 1).padStart(2, '0')}`,
      count: i + 1,
    }));
    const { container } = renderWithTheme(
      <FrequencyChart data={manyPoints} title="Many" color="#4281a4" />,
    );
    // Should show only 12 bar labels
    const barLabels = container.querySelectorAll('[title]');
    expect(barLabels.length).toBeLessThanOrEqual(12);
  });
});

/* ═══════════════════════ CorrelationChart ═══════════════════════ */

describe('CorrelationChart', () => {
  const sampleData: CorrelationResult[] = [
    {
      trigger: { id: '1', name: 'Dairy', type: 'food' },
      symptom: { name: 'Bloating' },
      correlation: 80,
      occurrences: 8,
      totalSymptomOccurrences: 10,
      avgTimeToSymptom: 120,
    },
    {
      trigger: { id: '2', name: 'Ibuprofen', type: 'medication' },
      symptom: { name: 'Stomach Pain' },
      correlation: 45,
      occurrences: 3,
      totalSymptomOccurrences: 7,
      avgTimeToSymptom: 30,
    },
  ];

  it('renders the title', () => {
    renderWithTheme(<CorrelationChart data={sampleData} title="Correlations" />);
    expect(screen.getByText('Correlations')).toBeInTheDocument();
  });

  it('shows empty state when data is empty', () => {
    renderWithTheme(<CorrelationChart data={[]} title="No Correlations" />);
    expect(screen.getByText(/No correlations detected/)).toBeInTheDocument();
  });

  it('renders trigger and symptom names', () => {
    renderWithTheme(<CorrelationChart data={sampleData} title="Correlations" />);
    expect(screen.getByText('Dairy')).toBeInTheDocument();
    expect(screen.getByText('Bloating')).toBeInTheDocument();
    expect(screen.getByText('Ibuprofen')).toBeInTheDocument();
    expect(screen.getByText('Stomach Pain')).toBeInTheDocument();
  });

  it('renders correlation percentages', () => {
    renderWithTheme(<CorrelationChart data={sampleData} title="Correlations" />);
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('renders occurrence counts', () => {
    renderWithTheme(<CorrelationChart data={sampleData} title="Correlations" />);
    expect(screen.getByText('8 of 10 occurrences')).toBeInTheDocument();
    expect(screen.getByText('3 of 7 occurrences')).toBeInTheDocument();
  });

  it('renders average time to symptom', () => {
    renderWithTheme(<CorrelationChart data={sampleData} title="Correlations" />);
    expect(screen.getByText('Avg: 2.0 hrs')).toBeInTheDocument();
    expect(screen.getByText('Avg: 30 min')).toBeInTheDocument();
  });

  it('limits display to 10 items', () => {
    const manyData: CorrelationResult[] = Array.from({ length: 15 }, (_, i) => ({
      trigger: { id: String(i), name: `Trigger${i}`, type: 'food' as const },
      symptom: { name: `Symptom${i}` },
      correlation: 50,
      occurrences: 5,
      totalSymptomOccurrences: 10,
      avgTimeToSymptom: 60,
    }));
    renderWithTheme(<CorrelationChart data={manyData} title="Many" />);
    // Trigger0-Trigger9 should be shown, Trigger10+ should not
    expect(screen.getByText('Trigger0')).toBeInTheDocument();
    expect(screen.getByText('Trigger9')).toBeInTheDocument();
    expect(screen.queryByText('Trigger10')).not.toBeInTheDocument();
  });
});
