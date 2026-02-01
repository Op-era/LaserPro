/**
 * Analytics Dashboard - Phase 3 Feature
 * Job analytics, efficiency metrics, and sustainability tracking
 */

export interface JobAnalytics {
  jobId: string;
  jobName: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // seconds
  status: 'queued' | 'running' | 'completed' | 'failed';
  efficiency: number; // percentage
  materialUsed: number; // square mm
  energyUsed: number; // kWh
  cost: number; // currency units
}

export interface EfficiencyMetrics {
  totalJobs: number;
  successRate: number; // percentage
  avgJobDuration: number; // seconds
  avgEfficiency: number; // percentage
  totalMaterialUsed: number; // square mm
  totalEnergyUsed: number; // kWh
  totalCost: number;
}

export interface SustainabilityMetrics {
  carbonFootprint: number; // kg CO2
  materialWaste: number; // percentage
  energyEfficiency: number; // percentage
  wasteReduction: number; // vs baseline, percentage
  recommendations: string[];
}

export interface DashboardData {
  analytics: JobAnalytics[];
  efficiency: EfficiencyMetrics;
  sustainability: SustainabilityMetrics;
  trends: {
    date: string;
    jobs: number;
    efficiency: number;
    energy: number;
  }[];
}

/**
 * Calculate job efficiency based on actual vs estimated time
 */
export function calculateJobEfficiency(
  estimatedTime: number,
  actualTime: number
): number {
  if (estimatedTime === 0) return 100;
  const efficiency = (estimatedTime / actualTime) * 100;
  return Math.min(100, Math.max(0, efficiency));
}

/**
 * Calculate material waste percentage
 */
export function calculateMaterialWaste(
  totalMaterial: number,
  usedMaterial: number
): number {
  if (totalMaterial === 0) return 0;
  return ((totalMaterial - usedMaterial) / totalMaterial) * 100;
}

/**
 * Estimate energy usage for a job
 */
export function estimateEnergyUsage(
  power: number, // watts
  duration: number, // seconds
  efficiency: number = 0.85 // laser efficiency factor
): number {
  // Convert to kWh
  const kWh = (power * duration * efficiency) / (1000 * 3600);
  return kWh;
}

/**
 * Calculate carbon footprint based on energy usage
 */
export function calculateCarbonFootprint(
  energyKWh: number,
  gridCarbonIntensity: number = 0.5 // kg CO2 per kWh (default average)
): number {
  return energyKWh * gridCarbonIntensity;
}

/**
 * Generate efficiency metrics from job history
 */
export function generateEfficiencyMetrics(jobs: JobAnalytics[]): EfficiencyMetrics {
  const completed = jobs.filter(j => j.status === 'completed');
  const totalJobs = jobs.length;
  const successRate = totalJobs > 0 ? (completed.length / totalJobs) * 100 : 0;
  
  const avgDuration =
    completed.length > 0
      ? completed.reduce((sum, j) => sum + j.duration, 0) / completed.length
      : 0;
  
  const avgEfficiency =
    completed.length > 0
      ? completed.reduce((sum, j) => sum + j.efficiency, 0) / completed.length
      : 0;
  
  const totalMaterialUsed = jobs.reduce((sum, j) => sum + j.materialUsed, 0);
  const totalEnergyUsed = jobs.reduce((sum, j) => sum + j.energyUsed, 0);
  const totalCost = jobs.reduce((sum, j) => sum + j.cost, 0);
  
  return {
    totalJobs,
    successRate,
    avgJobDuration: avgDuration,
    avgEfficiency,
    totalMaterialUsed,
    totalEnergyUsed,
    totalCost,
  };
}

/**
 * Generate sustainability metrics
 */
export function generateSustainabilityMetrics(
  jobs: JobAnalytics[],
  materialSheetSize: number = 300 * 300 // default 300x300mm
): SustainabilityMetrics {
  const totalEnergy = jobs.reduce((sum, j) => sum + j.energyUsed, 0);
  const totalMaterial = jobs.reduce((sum, j) => sum + j.materialUsed, 0);
  
  const carbonFootprint = calculateCarbonFootprint(totalEnergy);
  const materialWaste = calculateMaterialWaste(
    materialSheetSize * jobs.length,
    totalMaterial
  );
  
  // Calculate energy efficiency (actual vs theoretical max)
  const theoreticalMax = totalEnergy * 1.5; // Assume 50% overhead for ideal case
  const energyEfficiency = (totalEnergy / theoreticalMax) * 100;
  
  const recommendations: string[] = [];
  
  if (materialWaste > 30) {
    recommendations.push('High material waste - consider better nesting algorithms');
  }
  if (energyEfficiency < 70) {
    recommendations.push('Energy efficiency can be improved - optimize path planning');
  }
  if (carbonFootprint > 10) {
    recommendations.push('Consider renewable energy sources to reduce carbon footprint');
  }
  
  // Estimate waste reduction compared to 40% baseline
  const wasteReduction = Math.max(0, 40 - materialWaste);
  
  return {
    carbonFootprint,
    materialWaste,
    energyEfficiency,
    wasteReduction,
    recommendations,
  };
}

/**
 * Generate trend data for dashboard charts
 */
export function generateTrendData(
  jobs: JobAnalytics[],
  days: number = 7
): Array<{ date: string; jobs: number; efficiency: number; energy: number }> {
  const trends: Array<{ date: string; jobs: number; efficiency: number; energy: number }> = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayJobs = jobs.filter(j => {
      const jobDate = new Date(j.startTime).toISOString().split('T')[0];
      return jobDate === dateStr;
    });
    
    const avgEfficiency =
      dayJobs.length > 0
        ? dayJobs.reduce((sum, j) => sum + j.efficiency, 0) / dayJobs.length
        : 0;
    
    const totalEnergy = dayJobs.reduce((sum, j) => sum + j.energyUsed, 0);
    
    trends.push({
      date: dateStr,
      jobs: dayJobs.length,
      efficiency: avgEfficiency,
      energy: totalEnergy,
    });
  }
  
  return trends;
}

/**
 * Export analytics data for reporting
 */
export function exportAnalyticsReport(data: DashboardData, format: 'csv' | 'json'): string {
  if (format === 'json') {
    return JSON.stringify(data, null, 2);
  }
  
  // CSV export
  let csv = 'Job ID,Job Name,Start Time,Duration (s),Status,Efficiency (%),Material Used (mm²),Energy (kWh),Cost\n';
  
  data.analytics.forEach(job => {
    csv += `${job.jobId},${job.jobName},${job.startTime.toISOString()},${job.duration},${job.status},${job.efficiency.toFixed(2)},${job.materialUsed.toFixed(2)},${job.energyUsed.toFixed(4)},${job.cost.toFixed(2)}\n`;
  });
  
  return csv;
}
