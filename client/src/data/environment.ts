export const LAB_NOTICE =
  'All activity in HavenSec Arena is synthetic. The platform does not attack, scan, or access real systems.';

export const SYNTHETIC_ASSETS = [
  { id: 'WEB-01', name: 'WEB-01', type: 'Web Server', ip: '10.0.1.10', zone: 'DMZ' },
  { id: 'API-01', name: 'API-01', type: 'REST API', ip: '10.0.1.20', zone: 'App' },
  { id: 'AUTH-01', name: 'AUTH-01', type: 'Auth Service', ip: '10.0.2.10', zone: 'Identity' },
  { id: 'DB-01', name: 'DB-01', type: 'Database', ip: '10.0.3.10', zone: 'Data' },
  { id: 'FILE-01', name: 'FILE-01', type: 'File Server', ip: '10.0.3.20', zone: 'Data' },
] as const;

export const ORGANIZATION = {
  name: 'Acme Digital',
  environment: 'Acme Web Platform',
  range: 'Isolated cyber range (in-memory)',
};
