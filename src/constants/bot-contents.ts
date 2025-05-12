type TTabsTitle = {
    [key: string]: string | number;
};

type TDashboardTabIndex = {
    [key: string]: number;
};

export const tabs_title: TTabsTitle = Object.freeze({
    WORKSPACE: 'Workspace',
    CHART: 'Chart',
});

export const DBOT_TABS: TDashboardTabIndex = Object.freeze({
    DASHBOARD: 0,
    BOT_BUILDER: 1,
    CHART: 2,
    TUTORIAL: 3,
    SMARTANALYSISTOOL: 4,
    FREEBOTS: 5,
    TOOLS_HUB: 6,
    ANALYSIS_TOOL: 7,
    COPY_TRADING: 8,
});

export const MAX_STRATEGIES = 10;

export const TAB_IDS = [
    'id-dbot-dashboard',
    'id-bot-builder',
    'id-charts',
    'id-tutorials',
    'id-SmartAnalysisTool',
    'id-freebots',
    'id-tools-hub',
    'id-analysis-tool',
    'id-copy-trading',
];

export const DEBOUNCE_INTERVAL_TIME = 500;
