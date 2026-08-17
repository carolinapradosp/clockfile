// interfaces/BugReport.ts

export type BugReportStatus = 'open' | 'reviewing' | 'resolved' | 'closed';

export type BugReportPriority = 'low' | 'normal' | 'high' | 'critical';

export type CreateBugReportInput = {
    subject: string;
    message: string;
    pageUrl: string | null;
};

export type CreateBugReportResult =
    | {
          success: true;
          message: string;
          reportId: string;
      }
    | {
          success: false;
          message: string;

          fieldErrors?: {
              subject?: string;
              message?: string;
          };
      };
