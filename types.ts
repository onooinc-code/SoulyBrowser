
export enum SelectorType {
  ClassName = 'Class Name',
  Id = 'ID',
  TagName = 'Tag Name',
}

export enum MonitorStatus {
    Idle = 'Idle',
    Monitoring = 'Monitoring',
    Triggered = 'Triggered',
    Error = 'Error',
}

export interface MonitorJob {
  id: string;
  url: string;
  selectorType: SelectorType;
  selectorValue: string;
  triggerValue: string;
  targetApiUrl: string;
  status: MonitorStatus;
  lastContent: string | null;
  lastCheck: Date | null;
  message: string | null;
}
