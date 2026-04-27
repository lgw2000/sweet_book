document.addEventListener('DOMContentLoaded', () => {
    const THEME_STORAGE_KEYS = ['theme', 'sweetBookTheme', 'colorTheme', 'appTheme', 'uiTheme', 'preferredTheme'];
    const APP_VIEW_STATE_KEY = 'sweetBookViewState';
    const pages = {
        home: document.getElementById('home-page'),
        login: document.getElementById('login-page'),
        adminLogin: document.getElementById('admin-login-page'),
        admin: document.getElementById('admin-page'),
        find: document.getElementById('find-page'),
        signup: document.getElementById('signup-page')
    };

    const state = {
        currentUserId: localStorage.getItem('loggedInUser') || '',
        adminToken: localStorage.getItem('adminToken') || '',
        currentAdminView: 'posts',
        currentUser: null,
        currentSettings: null,
        currentFeedType: 'latest',
        currentPopularTime: 'alltime',
        currentNotificationTab: 'all',
        currentSettingsView: 'home',
        currentSettingsManagerType: '',
        currentProfileData: null,
        currentProfileTab: 'posts',
        currentDetailPost: null,
        highlightedReplyId: null,
        currentHookView: 'books',
        currentHookSource: 'selected',
        hookSourceQuery: '',
        currentHookBookId: null,
        activityPeriod: 'week',
        activityStart: '',
        activityTrail: [],
        hookSources: { liked: [], saved: [], top_liked: [], top_viewed: [] },
        hookGlobalResults: [],
        hookSelectedPostMap: new Map(),
        hookBooks: [],
        hookOrders: [],
        feedLimit: 100,
        feedOffset: 0,
        feedHasMore: false,
        feedLoadingMore: false,
        openingPermalink: false,
        commandSelectionMode: false,
        commandSelectedElement: null,
        selectedImages: [],
        dragCounter: 0
    };

    const els = {
        feedContent: document.querySelector('.feed-content'),
        searchContent: document.querySelector('.search-content'),
        notificationsContent: document.querySelector('.notifications-content'),
        activityContent: document.querySelector('.activity-content'),
        hookContent: document.querySelector('.hook-content'),
        feedStream: document.getElementById('feed-stream'),
        searchResults: document.getElementById('search-results'),
        notificationsResults: document.getElementById('notifications-results'),
        notificationsReadAllBtn: document.getElementById('notifications-read-all-btn'),
        notificationTabs: document.querySelectorAll('.notification-tab'),
        activityResults: document.getElementById('activity-results'),
        activityRefreshBtn: document.getElementById('activity-refresh-btn'),
        activityPeriodTabs: document.querySelectorAll('.activity-period-tab'),
        activityBackBtn: document.getElementById('activity-back-btn'),
        activityDrillLabel: document.getElementById('activity-drill-label'),
        navHomeBtn: document.getElementById('nav-home-btn'),
        brandLogo: document.getElementById('brand-logo'),
        navSearchBtn: document.getElementById('nav-search-btn'),
        navHookBtn: document.getElementById('nav-hook-btn'),
        navNotifBtn: document.getElementById('nav-notif-btn'),
        navProfileBtn: document.getElementById('nav-profile-btn'),
        notifBadge: document.getElementById('notif-badge'),
        sidebarAvatar: document.getElementById('sidebar-profile-avatar'),
        searchInput: document.getElementById('search-input'),
        searchSubmitBtn: document.getElementById('search-submit-btn'),
        feedTabs: document.querySelectorAll('.feed-tab'),
        popularSubtabs: document.getElementById('popular-subtabs'),
        subTabs: document.querySelectorAll('.sub-tab'),
        detailOverlay: document.getElementById('post-detail-overlay'),
        detailPostContent: document.getElementById('detail-post-content'),
        detailReplies: document.getElementById('detail-replies'),
        detailReplyInput: document.getElementById('detail-reply-input'),
        detailReplySubmit: document.getElementById('detail-reply-submit'),
        detailBackBtn: document.getElementById('detail-back-btn'),
        profileOverlay: document.getElementById('profile-overlay'),
        profileInfo: document.getElementById('profile-info'),
        profileContent: document.getElementById('profile-content'),
        profileBackBtn: document.getElementById('profile-back-btn'),
        profileTabs: document.querySelectorAll('.profile-tab'),
        profileSavesTab: document.getElementById('profile-saves-tab'),
        profileEditOverlay: document.getElementById('profile-edit-overlay'),
        profileEditBackBtn: document.getElementById('profile-edit-back-btn'),
        profileEditForm: document.getElementById('profile-edit-form'),
        profileEditAvatarPreview: document.getElementById('profile-edit-avatar-preview'),
        profileImageInput: document.getElementById('profile-image-input'),
        profileImageFileName: document.getElementById('profile-image-file-name'),
        profileDisplayNameInput: document.getElementById('profile-display-name-input'),
        profileBioInput: document.getElementById('profile-bio-input'),
        profileInterestsInput: document.getElementById('profile-interests-input'),
        goPrivacySettingsBtn: document.getElementById('go-privacy-settings-btn'),
        settingsOverlay: document.getElementById('settings-overlay'),
        settingsShell: document.querySelector('.settings-shell'),
        settingsHomeView: document.getElementById('settings-home-view'),
        settingsPrivacyView: document.getElementById('settings-privacy-view'),
        settingsContentView: document.getElementById('settings-content-view'),
        settingsBackBtn: document.getElementById('settings-back-btn'),
        saveSettingsBtn: document.getElementById('save-settings-btn'),
        saveContentSettingsBtn: document.getElementById('save-content-settings-btn'),
        openPrivacySettingsBtn: document.getElementById('open-privacy-settings-btn'),
        openContentSettingsBtn: document.getElementById('open-content-settings-btn'),
        settingsDetailBackBtns: document.querySelectorAll('.settings-detail-back-btn'),
        settingsManageTriggers: document.querySelectorAll('.settings-manage-trigger'),
        settingsManagerOverlay: document.getElementById('settings-manager-overlay'),
        settingsManagerBackBtn: document.getElementById('settings-manager-back-btn'),
        settingsManagerTitle: document.getElementById('settings-manager-title'),
        settingsManagerDesc: document.getElementById('settings-manager-desc'),
        settingsUserSearchInput: document.getElementById('settings-user-search-input'),
        settingsUserSearchBtn: document.getElementById('settings-user-search-btn'),
        settingsUserSearchResults: document.getElementById('settings-user-search-results'),
        settingsManagerCurrentList: document.getElementById('settings-manager-current-list'),
        sidebarSettingsBtn: document.getElementById('sidebar-settings-btn'),
        sidebarActivityBtn: document.getElementById('sidebar-activity-btn'),
        sidebarSavedBtn: document.getElementById('sidebar-saved-btn'),
        sidebarBugReportBtn: document.getElementById('sidebar-bug-report-btn'),
        bugReportOverlay: document.getElementById('bug-report-overlay'),
        bugReportBackBtn: document.getElementById('bug-report-back-btn'),
        bugReportForm: document.getElementById('bug-report-form'),
        bugReportTitleInput: document.getElementById('bug-report-title-input'),
        bugReportContentInput: document.getElementById('bug-report-content-input'),
        bugReportImageInput: document.getElementById('bug-report-image-input'),
        bugReportFileName: document.getElementById('bug-report-file-name'),
        restrictedProfilesList: document.getElementById('restricted-profiles-list'),
        blockedProfilesList: document.getElementById('blocked-profiles-list'),
        mutedProfilesList: document.getElementById('muted-profiles-list'),
        customFiltersList: document.getElementById('custom-filters-list'),
        customFilterInput: document.getElementById('custom-filter-input'),
        addCustomFilterBtn: document.getElementById('add-custom-filter-btn'),
        settingPrivateProfile: document.getElementById('setting-private-profile'),
        settingMentionPermission: document.getElementById('setting-mention-permission'),
        settingTagPermission: document.getElementById('setting-tag-permission'),
        settingActivityVisibility: document.getElementById('setting-activity-visibility'),
        settingHideOffensive: document.getElementById('setting-hide-offensive'),
        settingHideLikeCounts: document.getElementById('setting-hide-like-counts'),
        hookRefreshBtn: document.getElementById('hook-refresh-btn'),
        hookViewTabs: document.querySelectorAll('.hook-view-tab'),
        hookPanels: document.querySelectorAll('[data-hook-panel]'),
        hookBuilderOverlay: document.getElementById('hook-builder-overlay'),
        hookBuilderCloseBtn: document.getElementById('hook-builder-close-btn'),
        hookOpenBuilderBtn: document.getElementById('hook-open-builder-btn'),
        hookSourceTabs: document.querySelectorAll('.hook-source-tab'),
        hookSourceList: document.getElementById('hook-source-list'),
        hookPostSearchInput: document.getElementById('hook-post-search-input'),
        hookPostSearchBtn: document.getElementById('hook-post-search-btn'),
        hookPostSearchResults: document.getElementById('hook-post-search-results'),
        hookBookTitleInput: document.getElementById('hook-book-title-input'),
        hookSaveBookBtn: document.getElementById('hook-save-book-btn'),
        hookBooksList: document.getElementById('hook-books-list'),
        hookOrdersList: document.getElementById('hook-orders-list'),
        imageUploadInput: document.getElementById('image-upload-input'),
        imagePreviewBar: document.getElementById('image-preview-bar'),
        addPhotoBtn: document.getElementById('add-photo-btn'),
        postInput: document.getElementById('new-post-input'),
        postSubmitBtn: document.getElementById('post-submit-btn'),
        dropZone: document.getElementById('drop-zone'),
        logoutBtn: document.getElementById('logout-btn'),
        moreBtn: document.getElementById('more-btn'),
        moreMenu: document.getElementById('more-menu'),
        themeToggleBtn: document.getElementById('theme-toggle-btn'),
        themeToggleBtns: document.querySelectorAll('[data-theme-toggle]'),
        themeIcon: document.getElementById('theme-icon'),
        commandModeOverlay: document.getElementById('command-mode-overlay'),
        commandModeInput: document.getElementById('command-mode-input'),
        commandModeHistory: document.getElementById('command-mode-history'),
        commandSelectionStatus: document.getElementById('command-selection-status'),
        commandSelectionLabel: document.getElementById('command-selection-label'),
        commandModeCloseBtn: document.getElementById('command-mode-close-btn'),
        adminLoginForm: document.getElementById('admin-login-form'),
        adminLogoutBtn: document.getElementById('admin-logout-btn'),
        adminTabs: document.querySelectorAll('[data-admin-view]'),
        adminPanels: document.querySelectorAll('[data-admin-panel]'),
        adminPostSearchInput: document.getElementById('admin-post-search-input'),
        adminPostSearchBtn: document.getElementById('admin-post-search-btn'),
        adminPostsList: document.getElementById('admin-posts-list'),
        adminOrderSearchInput: document.getElementById('admin-order-search-input'),
        adminOrderSearchBtn: document.getElementById('admin-order-search-btn'),
        adminOrdersList: document.getElementById('admin-orders-list'),
        adminReportsList: document.getElementById('admin-reports-list'),
        adminBugReportsList: document.getElementById('admin-bug-reports-list'),
        adminPostDetailOverlay: document.getElementById('admin-post-detail-overlay'),
        adminDetailCloseBtn: document.getElementById('admin-detail-close-btn'),
        adminDetailTitle: document.getElementById('admin-detail-title'),
        adminDetailBody: document.getElementById('admin-detail-body')
    };

    function navigateTo(pageId) {
        Object.values(pages).forEach(page => page.classList.remove('active'));
        pages[pageId]?.classList.add('active');
    }

    function getStoredThemePreference() {
        const storedThemes = THEME_STORAGE_KEYS
            .map(key => localStorage.getItem(key))
            .filter(Boolean)
            .map(theme => String(theme).toLowerCase());

        return storedThemes.some(theme => theme.includes('light')) ? 'light' : 'dark';
    }

    function syncThemeStorage(theme) {
        THEME_STORAGE_KEYS.forEach(key => localStorage.setItem(key, theme));
    }

    function applyTheme(theme = getStoredThemePreference()) {
        const light = String(theme).toLowerCase().includes('light');
        const normalizedTheme = light ? 'light' : 'dark';
        document.documentElement.classList.toggle('light-mode', light);
        document.documentElement.dataset.theme = normalizedTheme;
        document.body.classList.toggle('light-mode', light);
        document.body.dataset.theme = normalizedTheme;
        const themeIcons = [
            els.themeIcon,
            ...document.querySelectorAll('[data-theme-toggle-icon]')
        ].filter(Boolean);
        themeIcons.forEach(icon => {
            icon.classList.toggle('ph-moon', light);
            icon.classList.toggle('ph-sun', !light);
        });
        document.querySelectorAll('[data-theme-toggle-label]').forEach(label => {
            label.textContent = light ? '다크 모드' : '라이트 모드';
        });
        syncThemeStorage(normalizedTheme);
    }

    function getSavedViewState() {
        try {
            return JSON.parse(localStorage.getItem(APP_VIEW_STATE_KEY) || '{}');
        } catch (error) {
            return {};
        }
    }

    function saveViewState(partial = {}) {
        const next = {
            ...getSavedViewState(),
            mainSection: localStorage.getItem('mainSection') || 'home',
            feedType: state.currentFeedType,
            popularTime: state.currentPopularTime,
            notificationTab: state.currentNotificationTab,
            activityPeriod: state.activityPeriod,
            activityStart: state.activityStart,
            hookView: state.currentHookView,
            hookSource: state.currentHookSource,
            ...partial
        };
        localStorage.setItem(APP_VIEW_STATE_KEY, JSON.stringify(next));
    }

    function restoreViewState() {
        const saved = getSavedViewState();
        const validFeedTypes = new Set(['latest', 'popular', 'related']);
        const validPopularTimes = new Set(['alltime', 'year', 'month', 'week', 'day']);
        const validNotificationTabs = new Set(['all', 'mentions', 'likes', 'comments']);
        const validActivityPeriods = new Set(['day', 'week', 'month', 'year']);
        const validHookViews = new Set(['books', 'orders']);
        const validHookSources = new Set(['all', 'selected', 'liked', 'saved', 'top_liked', 'top_viewed']);

        if (validFeedTypes.has(saved.feedType)) state.currentFeedType = saved.feedType;
        if (validPopularTimes.has(saved.popularTime)) state.currentPopularTime = saved.popularTime;
        if (validNotificationTabs.has(saved.notificationTab)) state.currentNotificationTab = saved.notificationTab;
        if (validActivityPeriods.has(saved.activityPeriod)) state.activityPeriod = saved.activityPeriod;
        if (typeof saved.activityStart === 'string') state.activityStart = saved.activityStart;
        if (validHookViews.has(saved.hookView)) state.currentHookView = saved.hookView;
        if (validHookSources.has(saved.hookSource)) state.currentHookSource = saved.hookSource;
    }

    function syncFeedControls() {
        els.feedTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.type === state.currentFeedType));
        els.subTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.time === state.currentPopularTime));
        els.popularSubtabs?.classList.toggle('hidden', state.currentFeedType !== 'popular');
    }

    function isEditableTarget(target = document.activeElement) {
        if (!target) return false;
        const tagName = target.tagName?.toLowerCase();
        return target.isContentEditable || ['input', 'textarea', 'select'].includes(tagName);
    }

    const COMMAND_TARGET_SELECTOR = [
        '.feed-tab',
        '.sub-tab:not(.hidden)',
        '.notification-tab',
        '.activity-period-tab',
        '.hook-view-tab',
        '.hook-source-tab',
        '.profile-tab',
        '.feed-post',
        '.search-user-card',
        '.notification-card',
        '.hook-source-main',
        '.hook-book-card'
    ].join(',');

    function isCommandModeOpen() {
        return Boolean(els.commandModeOverlay && !els.commandModeOverlay.classList.contains('hidden'));
    }

    function resetCommandModeInput(shouldFocus = true) {
        if (!els.commandModeInput) return;
        els.commandModeInput.value = '';
        if (shouldFocus) els.commandModeInput.focus();
    }

    function getActiveCommandRoot() {
        const overlays = [els.detailOverlay, els.profileOverlay, els.settingsOverlay, els.hookBuilderOverlay];
        return overlays.find(overlay => overlay && !overlay.classList.contains('hidden')) || document;
    }

    function isCommandTargetVisible(element) {
        if (!element || element.closest('#command-mode-overlay') || element.closest('.hidden')) return false;
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
    }

    function getCommandTargets() {
        const root = getActiveCommandRoot();
        return Array.from(root.querySelectorAll(COMMAND_TARGET_SELECTOR)).filter(isCommandTargetVisible);
    }

    function getCommandTargetLabel(element) {
        if (!element) return '선택할 항목이 없습니다.';
        const text = (element.textContent || '').replace(/\s+/g, ' ').trim();
        if (element.classList.contains('feed-post')) {
            const author = element.querySelector('.username')?.textContent?.trim() || '글';
            const body = element.querySelector('.post-text-below-image')?.textContent?.trim() || '이미지 게시물';
            return `글 · ${author} · ${makeClientPreview(body, 34)}`;
        }
        if (element.classList.contains('hook-source-main')) {
            return `HOOK 글 · ${makeClientPreview(text, 42)}`;
        }
        if (element.classList.contains('notification-card')) {
            return `알림 · ${makeClientPreview(text, 42)}`;
        }
        if (element.classList.contains('search-user-card')) {
            return `사용자 · ${makeClientPreview(text, 42)}`;
        }
        if (element.classList.contains('hook-book-card')) {
            return `책 · ${makeClientPreview(text, 42)}`;
        }
        return `탭 · ${makeClientPreview(text, 42)}`;
    }

    function updateCommandSelectionStatus() {
        if (!els.commandSelectionStatus || !els.commandSelectionLabel) return;
        els.commandSelectionStatus.classList.toggle('hidden', !state.commandSelectionMode);
        if (!state.commandSelectionMode) return;
        els.commandSelectionLabel.textContent = getCommandTargetLabel(state.commandSelectedElement);
    }

    function clearCommandSelection() {
        state.commandSelectedElement?.classList.remove('command-selected');
        state.commandSelectedElement?.removeAttribute('aria-current');
        state.commandSelectedElement = null;
        updateCommandSelectionStatus();
    }

    function disableCommandSelection(shouldFocus = true) {
        state.commandSelectionMode = false;
        clearCommandSelection();
        document.body.classList.remove('command-selection-active');
        els.commandModeOverlay?.classList.remove('selection-on');
        els.commandSelectionStatus?.classList.add('hidden');
        if (shouldFocus && isCommandModeOpen()) resetCommandModeInput(true);
    }

    function selectCommandElement(element, options = {}) {
        if (!element) return;
        state.commandSelectedElement?.classList.remove('command-selected');
        state.commandSelectedElement?.removeAttribute('aria-current');
        state.commandSelectedElement = element;
        element.classList.add('command-selected');
        element.setAttribute('aria-current', 'true');
        if (options.scroll !== false) {
            element.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
        }
        updateCommandSelectionStatus();
    }

    function selectInitialCommandTarget() {
        const targets = getCommandTargets();
        if (!targets.length) {
            clearCommandSelection();
            addCommandModeHistory('error', '선택할 항목이 없어요', '현재 화면에서 글이나 탭을 찾지 못했어요.');
            return false;
        }
        const viewportCenter = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2
        };
        const best = targets
            .map(element => {
                const rect = element.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                return { element, score: Math.hypot(x - viewportCenter.x, y - viewportCenter.y) };
            })
            .sort((a, b) => a.score - b.score)[0]?.element;
        selectCommandElement(best);
        return true;
    }

    function enableCommandSelection() {
        if (!isCommandModeOpen()) openCommandMode();
        state.commandSelectionMode = true;
        document.body.classList.add('command-selection-active');
        els.commandModeOverlay?.classList.add('selection-on');
        els.commandModeInput?.blur();
        if (!state.commandSelectedElement || !isCommandTargetVisible(state.commandSelectedElement)) {
            selectInitialCommandTarget();
        } else {
            selectCommandElement(state.commandSelectedElement, { scroll: false });
        }
        addCommandModeHistory('success', '선택 모드 켜짐', 'WASD/방향키 이동 · Enter 열기 · L 좋아요 · Y 공유 · B 저장 · C 댓글');
    }

    function moveCommandSelection(direction) {
        const targets = getCommandTargets();
        if (!targets.length) {
            clearCommandSelection();
            addCommandModeHistory('error', '이동할 항목이 없어요');
            return;
        }
        const current = state.commandSelectedElement;
        if (!current || !targets.includes(current)) {
            selectCommandElement(targets[0]);
            return;
        }
        const currentRect = current.getBoundingClientRect();
        const currentCenter = {
            x: currentRect.left + currentRect.width / 2,
            y: currentRect.top + currentRect.height / 2
        };
        const isVertical = direction === 'up' || direction === 'down';
        const sign = direction === 'down' || direction === 'right' ? 1 : -1;
        const ranked = targets
            .filter(element => element !== current)
            .map(element => {
                const rect = element.getBoundingClientRect();
                const center = {
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                };
                const primary = isVertical ? center.y - currentCenter.y : center.x - currentCenter.x;
                const secondary = isVertical ? Math.abs(center.x - currentCenter.x) : Math.abs(center.y - currentCenter.y);
                return { element, primary: primary * sign, score: Math.abs(primary) * 2 + secondary };
            })
            .filter(item => item.primary > 6)
            .sort((a, b) => a.score - b.score);

        if (ranked[0]) {
            selectCommandElement(ranked[0].element);
            return;
        }

        const index = targets.indexOf(current);
        const delta = direction === 'up' || direction === 'left' ? -1 : 1;
        selectCommandElement(targets[(index + delta + targets.length) % targets.length]);
    }

    function clickCommandTarget(element) {
        if (!element) return false;
        if (element.classList.contains('hook-book-card')) {
            element.querySelector('.hook-load-book-btn')?.click();
            return true;
        }
        if (element.matches('button, a, .feed-post, .notification-card, .search-user-card, .hook-source-main')) {
            element.click();
            return true;
        }
        const action = element.querySelector('button, a');
        if (action) {
            action.click();
            return true;
        }
        return false;
    }

    function runCommandSelectionAction(action = 'open') {
        if (!state.commandSelectionMode) enableCommandSelection();
        const target = state.commandSelectedElement;
        if (!target) return;
        const actionMap = {
            like: ['.like-btn'],
            share: ['.post-menu-share-btn'],
            save: ['.post-menu-save-btn', '.reply-save-btn'],
            report: ['.post-menu-report-btn', '.reply-report-btn'],
            delete: ['.post-menu-delete-btn', '.reply-delete-btn']
        };
        if (action === 'comment') {
            if (target.classList.contains('feed-post') || target.classList.contains('hook-source-main')) {
                clickCommandTarget(target);
                [220, 520, 900].forEach(delay => window.setTimeout(() => els.detailReplyInput?.focus(), delay));
                addCommandModeHistory('success', '댓글 입력으로 이동', getCommandTargetLabel(target));
                return;
            }
            els.detailReplyInput?.focus();
            addCommandModeHistory('success', '댓글 입력 대기', '현재 글의 댓글 입력창으로 이동했어요.');
            return;
        }
        const selectors = actionMap[action];
        if (selectors) {
            const button = selectors.map(selector => target.querySelector(selector)).find(Boolean);
            if (!button) {
                addCommandModeHistory('error', '이 항목에서는 실행할 수 없어요', getCommandTargetLabel(target));
                return;
            }
            button.click();
            addCommandModeHistory('success', `${button.textContent.replace(/\s+/g, ' ').trim()} 실행`, getCommandTargetLabel(target));
            return;
        }
        const didClick = clickCommandTarget(target);
        addCommandModeHistory(didClick ? 'success' : 'error', didClick ? '선택 항목 열기' : '열 수 없는 항목이에요', getCommandTargetLabel(target));
    }

    function handleCommandSelectionKeydown(e) {
        if (!state.commandSelectionMode || isEditableTarget(e.target) || e.metaKey || e.ctrlKey || e.altKey) return false;

        if (e.key === '/') {
            const now = Date.now();
            e.preventDefault();
            if (now - lastCommandSlashAt <= 420) {
                closeCommandMode();
                return true;
            }
            lastCommandSlashAt = now;
            return true;
        }

        const key = e.key.toLowerCase();
        const moveKeys = {
            arrowup: 'up',
            w: 'up',
            k: 'up',
            arrowdown: 'down',
            s: 'down',
            j: 'down',
            arrowleft: 'left',
            a: 'left',
            arrowright: 'right',
            d: 'right'
        };

        if (e.key === 'Tab') {
            e.preventDefault();
            const targets = getCommandTargets();
            if (!targets.length) return true;
            const currentIndex = targets.indexOf(state.commandSelectedElement);
            const delta = e.shiftKey ? -1 : 1;
            selectCommandElement(targets[(currentIndex + delta + targets.length) % targets.length]);
            return true;
        }

        if (moveKeys[key]) {
            e.preventDefault();
            moveCommandSelection(moveKeys[key]);
            return true;
        }

        if (e.shiftKey && key === 's') {
            e.preventDefault();
            runCommandSelectionAction('save');
            return true;
        }

        const actions = {
            enter: 'open',
            o: 'open',
            l: 'like',
            ' ': 'like',
            b: 'save',
            y: 'share',
            c: 'comment',
            i: 'comment',
            r: 'report',
            x: 'delete',
            delete: 'delete',
            backspace: 'delete'
        };

        if (actions[key]) {
            e.preventDefault();
            runCommandSelectionAction(actions[key]);
            return true;
        }

        if (key === 'escape' || key === ':') {
            e.preventDefault();
            disableCommandSelection(true);
            addCommandModeHistory('success', '선택 모드 나가기', '커맨드 모드는 유지됩니다. 다시 sel을 입력하면 선택 모드가 켜져요.');
            return true;
        }

        if (key === '?' || key === 'h') {
            e.preventDefault();
            showCommandHelp();
            return true;
        }

        return false;
    }

    function showCommandHelp() {
        const commands = [
            ['검색', 'sc 검색어 / search 검색어', '검색 탭으로 이동해서 입력한 검색어를 바로 검색합니다.'],
            ['이동', 'top / bot', '현재 열려 있는 화면의 맨 위 또는 맨 아래로 이동합니다.'],
            ['선택 모드', 'sel / select', '글과 탭을 키보드로 선택합니다. WASD, 방향키, Tab으로 이동합니다.'],
            ['선택 액션', 'open, like, share, save, comment, report, delete', '선택된 글을 열거나 좋아요, 공유, 저장, 댓글, 신고, 삭제를 실행합니다.'],
            ['피드', 'latest / pop / related / feed popular', '최신 피드, 인기 피드, 관련 피드로 전환합니다.'],
            ['주요 화면', 'home / hook / noti / act / me', '홈, HOOK, 알림, 내 활동, 내 프로필로 이동합니다.'],
            ['프로필', 'profile 아이디 / pf 아이디', '입력한 사용자 프로필을 엽니다. @는 붙여도 되고 안 붙여도 됩니다.'],
            ['설정', 'settings / privacy / content', '설정 홈, 개인정보 보호, 콘텐츠 기본설정으로 이동합니다.'],
            ['작성/신고', 'new / bug', '글쓰기 입력창으로 이동하거나 문제신고 창을 엽니다.'],
            ['화면 모드', 'theme / dark / light', 'theme은 라이트/다크를 토글하고, dark와 light는 원하는 모드로 바로 고정합니다.'],
            ['새로고침', 'refresh / reload', '브라우저 전체 새로고침 없이 현재 보고 있는 화면 데이터만 다시 불러옵니다.'],
            ['글 바로 열기', 'post 번호 / post 공개ID', '예: post 25 또는 post post-000025처럼 입력하면 해당 글 상세 화면을 바로 엽니다.'],
            ['글 공유', 'share / sh / share 번호 / share 공개ID', '현재 상세 글, 선택한 글, 입력한 글의 공유창을 열고 불가능하면 URL을 복사합니다.'],
            ['커맨드 관리', 'clear / exit / close / q', 'clear는 커맨드 기록을 지우고, exit/close/q는 커맨드 모드를 종료합니다.']
        ];
        commands.slice().reverse().forEach(([title, command, detail]) => {
            addCommandModeHistory('success', `${title}: ${command}`, detail);
        });
    }

    async function refreshCurrentCommandContext() {
        if (els.detailOverlay && !els.detailOverlay.classList.contains('hidden')) {
            await refreshCurrentDetailPost();
            return;
        }
        if (!els.feedContent?.classList.contains('hidden')) await loadFeed(state.currentFeedType === 'latest');
        else if (!els.searchContent?.classList.contains('hidden')) await doSearch();
        else if (!els.notificationsContent?.classList.contains('hidden')) await loadNotifications();
        else if (!els.activityContent?.classList.contains('hidden')) await loadActivity();
        else if (!els.hookContent?.classList.contains('hidden')) await loadHookDashboard();
    }

    function openCommandMode() {
        if (!pages.home?.classList.contains('active') || isEditableTarget()) return;
        disableCommandSelection(false);
        lastCommandInputSlashAt = 0;
        els.commandModeOverlay?.classList.remove('hidden');
        els.commandModeOverlay?.setAttribute('aria-hidden', 'false');
        if (els.commandModeInput) {
            els.commandModeInput.value = '';
            els.commandModeInput.focus();
        }
    }

    function closeCommandMode() {
        lastCommandSlashAt = 0;
        lastCommandInputSlashAt = 0;
        disableCommandSelection(false);
        els.commandModeOverlay?.classList.add('hidden');
        els.commandModeOverlay?.setAttribute('aria-hidden', 'true');
        els.commandModeInput?.blur();
    }

    function getCurrentScrollContainer() {
        if (els.detailOverlay && !els.detailOverlay.classList.contains('hidden')) return els.detailPostContent;
        if (els.profileOverlay && !els.profileOverlay.classList.contains('hidden')) return els.profileContent;
        if (els.settingsOverlay && !els.settingsOverlay.classList.contains('hidden')) return els.settingsShell;
        const containers = [
            els.feedContent,
            els.searchContent,
            els.notificationsContent,
            els.activityContent,
            els.hookContent
        ];
        return containers.find(container => container && !container.classList.contains('hidden')) || document.scrollingElement || document.documentElement;
    }

    function scrollCurrentPage(position) {
        const container = getCurrentScrollContainer();
        if (!container) return;
        const top = position === 'bottom' ? container.scrollHeight : 0;
        container.scrollTo({ top, behavior: 'auto' });
    }

    function addCommandModeHistory(type, title, detail = '') {
        if (!els.commandModeHistory) return;
        const entry = document.createElement('div');
        entry.className = `command-mode-entry ${type}`;
        entry.innerHTML = `
            <span class="command-mode-entry-dot"></span>
            <div>
                <strong>${escapeHtml(title)}</strong>
                ${detail ? `<span>${escapeHtml(detail)}</span>` : ''}
            </div>
        `;
        const hint = els.commandModeHistory.querySelector('.command-mode-hint');
        hint?.remove();
        els.commandModeHistory.prepend(entry);
        while (els.commandModeHistory.children.length > 10) {
            els.commandModeHistory.lastElementChild?.remove();
        }
    }

    async function runCommandModeCommand(rawCommand) {
        const command = rawCommand.trim();
        if (!command) return;
        const [name, ...rest] = command.split(/\s+/);
        const commandName = name.toLowerCase();
        const query = rest.join(' ').trim();

        if (['help', 'commands', 'cmd', '?', 'h'].includes(commandName)) {
            resetCommandModeInput();
            showCommandHelp();
            return;
        }

        if (['sel', 'select'].includes(commandName)) {
            resetCommandModeInput(false);
            enableCommandSelection();
            return;
        }

        if (['exit', 'close', 'q'].includes(commandName)) {
            closeCommandMode();
            return;
        }

        if (commandName === 'clear') {
            els.commandModeHistory.innerHTML = '';
            resetCommandModeInput();
            addCommandModeHistory('success', '기록을 비웠어요');
            return;
        }

        if ((commandName === 'sc' || commandName === 'search') && query) {
            switchMainSection('search');
            saveViewState({ mainSection: 'search' });
            els.searchInput.value = query;
            await doSearch();
            resetCommandModeInput();
            addCommandModeHistory('success', `검색 실행: ${query}`, '검색 탭에 결과를 업데이트했어요.');
            return;
        }

        if (commandName === 'top') {
            scrollCurrentPage('top');
            resetCommandModeInput();
            addCommandModeHistory('success', '맨 위로 이동', '현재 페이지의 가장 위로 이동했어요.');
            return;
        }

        if (commandName === 'bot' || commandName === 'bottom') {
            scrollCurrentPage('bottom');
            resetCommandModeInput();
            addCommandModeHistory('success', '맨 아래로 이동', '현재 페이지의 가장 아래로 이동했어요.');
            return;
        }

        if (['home', 'latest', 'pop', 'popular', 'related'].includes(commandName)) {
            switchMainSection('home');
            if (commandName === 'latest') state.currentFeedType = 'latest';
            if (commandName === 'pop' || commandName === 'popular') state.currentFeedType = 'popular';
            if (commandName === 'related') state.currentFeedType = 'related';
            syncFeedControls();
            saveViewState({ mainSection: 'home', feedType: state.currentFeedType });
            await loadFeed(commandName === 'latest' || commandName === 'home');
            resetCommandModeInput();
            addCommandModeHistory('success', '홈으로 이동', `${state.currentFeedType} 피드를 열었어요.`);
            return;
        }

        if (commandName === 'feed' && query) {
            const feedName = query.toLowerCase();
            const nextType = feedName.startsWith('pop') ? 'popular' : feedName.startsWith('rel') ? 'related' : 'latest';
            switchMainSection('home');
            state.currentFeedType = nextType;
            syncFeedControls();
            saveViewState({ mainSection: 'home', feedType: state.currentFeedType });
            await loadFeed(nextType === 'latest');
            resetCommandModeInput();
            addCommandModeHistory('success', '피드 전환', `${nextType} 피드를 열었어요.`);
            return;
        }

        if (['hook', 'book'].includes(commandName)) {
            switchMainSection('hook');
            setHookView(query === 'orders' || query === 'order' ? 'orders' : 'books');
            await loadHookDashboard();
            resetCommandModeInput();
            addCommandModeHistory('success', 'HOOK으로 이동', '책과 주문 관리 화면을 열었어요.');
            return;
        }

        if (['noti', 'notice', 'alarm', 'notifications'].includes(commandName)) {
            switchMainSection('notifications');
            await loadNotifications();
            resetCommandModeInput();
            addCommandModeHistory('success', '알림으로 이동');
            return;
        }

        if (['act', 'activity'].includes(commandName)) {
            switchMainSection('activity');
            await loadActivity();
            resetCommandModeInput();
            addCommandModeHistory('success', '내 활동으로 이동');
            return;
        }

        if (['me', 'profile', 'pf'].includes(commandName)) {
            const targetUser = (query || state.currentUserId).replace(/^@/, '');
            resetCommandModeInput();
            openProfile(targetUser);
            addCommandModeHistory('success', '프로필 열기', `@${targetUser}`);
            return;
        }

        if (['settings', 'setting', 'set'].includes(commandName)) {
            const section = query.toLowerCase().startsWith('content') || query.includes('콘텐츠') ? 'content' : query.toLowerCase().startsWith('privacy') || query.includes('개인') ? 'privacy' : '';
            resetCommandModeInput();
            await openSettings(section);
            addCommandModeHistory('success', '설정 열기', section ? section : '설정 홈');
            return;
        }

        if (['privacy', 'private'].includes(commandName)) {
            resetCommandModeInput();
            await openSettings('privacy');
            addCommandModeHistory('success', '개인정보 보호 열기');
            return;
        }

        if (['content', 'contents'].includes(commandName)) {
            resetCommandModeInput();
            await openSettings('content');
            addCommandModeHistory('success', '콘텐츠 기본설정 열기');
            return;
        }

        if (['bug', 'problem'].includes(commandName)) {
            resetCommandModeInput();
            els.bugReportOverlay?.classList.remove('hidden');
            els.moreMenu?.classList.remove('show');
            window.setTimeout(() => els.bugReportTitleInput?.focus(), 120);
            addCommandModeHistory('success', '문제신고 열기');
            return;
        }

        if (commandName === 'admin') {
            resetCommandModeInput();
            closeCommandMode();
            navigateTo('adminLogin');
            return;
        }

        if (['new', 'write', 'compose'].includes(commandName)) {
            switchMainSection('home');
            resetCommandModeInput(false);
            window.setTimeout(() => els.postInput?.focus(), 120);
            addCommandModeHistory('success', '글쓰기 준비', '입력창으로 이동했어요.');
            return;
        }

        if (commandName === 'theme') {
            const nextTheme = document.body.classList.contains('light-mode') ? 'dark' : 'light';
            applyTheme(nextTheme);
            resetCommandModeInput();
            addCommandModeHistory('success', '모드 전환', nextTheme === 'light' ? '라이트 모드' : '다크 모드');
            return;
        }

        if (['dark', 'darkmode'].includes(commandName)) {
            applyTheme('dark');
            resetCommandModeInput();
            addCommandModeHistory('success', '다크 모드 적용');
            return;
        }

        if (['light', 'lightmode'].includes(commandName)) {
            applyTheme('light');
            resetCommandModeInput();
            addCommandModeHistory('success', '라이트 모드 적용');
            return;
        }

        if (['refresh', 'reload'].includes(commandName)) {
            await refreshCurrentCommandContext();
            resetCommandModeInput();
            addCommandModeHistory('success', '새로고침 완료', '현재 화면 데이터를 다시 불러왔어요.');
            return;
        }

        if (commandName === 'post' && query) {
            const cleanedQuery = query.replace('#', '');
            if (!cleanedQuery) {
                addCommandModeHistory('error', '글 번호를 확인해주세요', command);
                return;
            }
            await openPostDetail(/^\d+$/.test(cleanedQuery) ? { id: Number(cleanedQuery) } : { public_id: cleanedQuery });
            resetCommandModeInput();
            addCommandModeHistory('success', '글 열기', `#${cleanedQuery}`);
            return;
        }

        if (['share', 'sh', 'link', 'copy'].includes(commandName)) {
            if (query || state.currentDetailPost) {
                try {
                    const postToShare = await fetchPostForShare(query);
                    if (!postToShare) {
                        addCommandModeHistory('error', '공유할 글을 선택해주세요', '상세 글을 열거나 선택 모드에서 글을 고른 뒤 share를 입력하세요.');
                        return;
                    }
                    const result = await sharePost(postToShare, null, { forceCopy: ['link', 'copy'].includes(commandName) });
                    resetCommandModeInput();
                    addCommandModeHistory('success', result === 'shared' ? '공유창 열기' : 'URL 복사 완료', getPostPublicId(postToShare));
                } catch (error) {
                    addCommandModeHistory('error', '공유 실패', error.message);
                }
                return;
            }
            runCommandSelectionAction('share');
            resetCommandModeInput(false);
            return;
        }

        if (['open', 'o'].includes(commandName)) {
            runCommandSelectionAction('open');
            resetCommandModeInput(false);
            return;
        }

        if (['like', 'l'].includes(commandName)) {
            runCommandSelectionAction('like');
            resetCommandModeInput(false);
            return;
        }

        if (['save', 's'].includes(commandName)) {
            runCommandSelectionAction('save');
            resetCommandModeInput(false);
            return;
        }

        if (['comment', 'c'].includes(commandName)) {
            runCommandSelectionAction('comment');
            resetCommandModeInput(false);
            return;
        }

        if (['report', 'rp'].includes(commandName)) {
            runCommandSelectionAction('report');
            resetCommandModeInput(false);
            return;
        }

        if (['delete', 'del'].includes(commandName)) {
            runCommandSelectionAction('delete');
            resetCommandModeInput(false);
            return;
        }

        addCommandModeHistory('error', '알 수 없는 명령', command);
        els.commandModeInput?.classList.add('command-mode-error');
        window.setTimeout(() => els.commandModeInput?.classList.remove('command-mode-error'), 360);
    }

    function switchMainSection(section, persist = true) {
        const sections = {
            home: els.feedContent,
            search: els.searchContent,
            notifications: els.notificationsContent,
            activity: els.activityContent,
            hook: els.hookContent
        };
        const navItems = {
            home: els.navHomeBtn,
            search: els.navSearchBtn,
            notifications: els.navNotifBtn,
            hook: els.navHookBtn
        };
        const nextSection = sections[section] ? section : 'home';
        if (persist) {
            localStorage.setItem('mainSection', nextSection);
            saveViewState({ mainSection: nextSection });
        }
        Object.entries(sections).forEach(([key, value]) => value?.classList.toggle('hidden', key !== nextSection));
        Object.entries(navItems).forEach(([key, value]) => value?.classList.toggle('active', key === nextSection));
    }

    async function loadMainSectionData(section) {
        if (section === 'notifications') {
            await loadNotifications();
            return;
        }
        if (section === 'activity') {
            await loadActivity();
            return;
        }
        if (section === 'hook') {
            setHookView(state.currentHookView || 'books');
            await loadHookDashboard();
            return;
        }
        if (section === 'search') return;
        syncFeedControls();
        await loadFeed(true);
    }

    function setAdminView(view) {
        state.currentAdminView = view || 'posts';
        const tabs = Array.from(els.adminTabs);
        const activeIndex = Math.max(0, tabs.findIndex(tab => tab.dataset.adminView === state.currentAdminView));
        tabs[0]?.parentElement?.style.setProperty('--admin-tab-index', activeIndex);
        els.adminTabs.forEach(tab => {
            const selected = tab.dataset.adminView === state.currentAdminView;
            tab.classList.toggle('active', selected);
            tab.setAttribute('aria-selected', selected ? 'true' : 'false');
        });
        els.adminPanels.forEach(panel => panel.classList.toggle('hidden', panel.dataset.adminPanel !== state.currentAdminView));
    }

    function addClick(id, callback) {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', callback);
    }

    async function postData(url, data) {
        return jsonData(url, data, 'POST');
    }

    async function jsonData(url, data, method = 'POST') {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.detail || '요청에 실패했습니다.');
        return result;
    }

    function downloadJsonFile(filename, data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }

    function escapeHtml(value = '') {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function getPostPublicId(post = {}) {
        if (post.public_id) return post.public_id;
        return post.id ? `post-${String(post.id).padStart(6, '0')}` : 'post-unknown';
    }

    function normalizePostIdentifier(value = '') {
        const cleaned = String(value || '').replace('#', '').trim();
        const publicIdMatch = cleaned.match(/^post-\d{6}/);
        return publicIdMatch ? publicIdMatch[0] : cleaned;
    }

    function extractNumericPostId(value = '') {
        const cleaned = normalizePostIdentifier(value);
        if (/^\d+$/.test(cleaned)) return Number(cleaned);
        const publicIdMatch = cleaned.match(/^post-(\d{6})/);
        if (publicIdMatch) return Number(publicIdMatch[1]);
        return 0;
    }

    function getPostUrl(post = {}) {
        const publicId = getPostPublicId(post);
        return post.url || `/posts/${encodeURIComponent(publicId)}`;
    }

    function getPostApiUrl(post = {}) {
        const publicId = getPostPublicId(post);
        return post.api_url || `/api/posts/public/${encodeURIComponent(publicId)}`;
    }

    function getAbsolutePostUrl(post = {}) {
        return new URL(getPostUrl(post), window.location.origin).href;
    }

    async function copyTextToClipboard(text) {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return;
        }
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
    }

    async function sharePost(post = {}, sourceButton = null, options = {}) {
        const url = getAbsolutePostUrl(post);
        if (!options.forceCopy && navigator.share) {
            await navigator.share({ url });
            return 'shared';
        }
        await copyTextToClipboard(url);
        if (sourceButton) {
            const previousHtml = sourceButton.innerHTML;
            sourceButton.innerHTML = '<i class="ph ph-check-circle"></i>URL 복사됨';
            sourceButton.classList.add('shared');
            setTimeout(() => {
                sourceButton.innerHTML = previousHtml;
                sourceButton.classList.remove('shared');
            }, 1300);
        }
        return 'copied';
    }

    async function fetchPostForShare(query) {
        const cleanedQuery = String(query || '').replace('#', '').trim();
        if (!cleanedQuery) return state.currentDetailPost;
        const post = await fetchPostByIdentifier(cleanedQuery);
        if (!post) throw new Error('공유할 글을 찾지 못했습니다.');
        return post;
    }

    async function fetchPostByIdentifier(identifier, incrementView = false) {
        const cleaned = normalizePostIdentifier(identifier);
        if (!cleaned) return null;
        const params = `user_id=${encodeURIComponent(state.currentUserId)}&increment_view=${incrementView ? 'true' : 'false'}`;
        const endpoints = [];
        if (/^\d+$/.test(cleaned)) {
            endpoints.push(`/api/post/${cleaned}?${params}`);
        } else {
            endpoints.push(`/api/posts/public/${encodeURIComponent(cleaned)}?${params}`);
            const numericId = extractNumericPostId(cleaned);
            if (numericId) endpoints.push(`/api/post/${numericId}?${params}`);
        }

        for (const endpoint of endpoints) {
            try {
                const res = await fetch(endpoint);
                if (res.ok) return res.json();
            } catch (error) {
                console.warn(error);
            }
        }
        return null;
    }

    function renderTextWithMentions(value = '') {
        const escaped = escapeHtml(value);
        return escaped.replace(/(^|\s)(@[^\s@]+)/g, '$1<span class="mention-token">$2</span>');
    }

    function getTimeStr(isoStr) {
        const date = new Date((isoStr || '').endsWith('Z') ? isoStr : `${isoStr}Z`);
        const diffMs = Math.max(0, new Date() - date);
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        if (diffSec < 60) return '방금 전';
        if (diffMin < 60) return `${diffMin}분 전`;
        if (diffHour < 24) return `${diffHour}시간 전`;
        if (diffDay < 7) return `${diffDay}일 전`;
        return date.toLocaleDateString();
    }

    function avatarHtml(user = {}, className = '', large = false) {
        const initials = escapeHtml(user.initials || (user.display_name || user.user_id || 'US').slice(0, 2).toUpperCase());
        const sizeClass = large ? ' large' : '';
        if (user.profile_image) {
            return `<img src="${user.profile_image}" alt="프로필" class="${className} profile-avatar-image${sizeClass}">`;
        }
        return `<div class="${className} avatar-fallback${sizeClass}">${initials}</div>`;
    }

    function updateSidebarUser() {
        const user = state.currentUser;
        if (!user || !els.sidebarAvatar) return;
        els.sidebarAvatar.outerHTML = avatarHtml(user, 'profile-pic', false).replace('class="profile-pic', `id="sidebar-profile-avatar" class="profile-pic`);
        els.sidebarAvatar = document.getElementById('sidebar-profile-avatar');
    }

    async function loadCurrentUserData() {
        if (!state.currentUserId) return;
        const res = await fetch(`/api/me?user_id=${encodeURIComponent(state.currentUserId)}`);
        if (!res.ok) return;
        const data = await res.json();
        state.currentUser = data;
        state.currentSettings = data.settings;
        updateSidebarUser();
        fillSettingsForm();
    }

    function fillSettingsForm() {
        if (!state.currentSettings) return;
        els.settingPrivateProfile.checked = !!state.currentSettings.is_private;
        els.settingMentionPermission.value = state.currentSettings.mention_permission || 'everyone';
        els.settingTagPermission.value = state.currentSettings.tag_permission || 'everyone';
        els.settingActivityVisibility.value = state.currentSettings.activity_visibility || 'everyone';
        els.settingHideOffensive.checked = !!state.currentSettings.hide_offensive_replies;
        els.settingHideLikeCounts.checked = !!state.currentSettings.hide_like_counts;
        renderCustomFilters(state.currentSettings.custom_filters || []);
        renderSettingsProfilePreview(els.restrictedProfilesList, state.currentSettings.restricted_profiles || [], '제한한 사람이 없습니다.');
        renderSettingsProfilePreview(els.blockedProfilesList, state.currentSettings.blocked_profiles || [], '아무도 차단하지 않았습니다.');
        renderSettingsProfilePreview(els.mutedProfilesList, state.currentSettings.muted_profiles || [], '업데이트를 보지 않도록 설정됨');
    }

    function renderCustomFilters(filters) {
        els.customFiltersList.innerHTML = '';
        if (!filters.length) {
            els.customFiltersList.innerHTML = '<span class="empty-inline-text">등록된 맞춤 필터가 없습니다.</span>';
            return;
        }
        filters.forEach(filter => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'tag-chip';
            chip.innerHTML = `${escapeHtml(filter)} <span>×</span>`;
            chip.addEventListener('click', async () => {
                try {
                    const data = await postData('/api/settings/custom-filter/remove', { user_id: state.currentUserId, keyword: filter });
                    state.currentSettings.custom_filters = data.custom_filters;
                    renderCustomFilters(data.custom_filters);
                    await Promise.all([loadFeed(), loadNotifications()]);
                    if (state.currentProfileData) openProfile(state.currentProfileData.user_id);
                } catch (error) {
                    alert(error.message);
                }
            });
            els.customFiltersList.appendChild(chip);
        });
    }

    function renderSettingsProfilePreview(container, items, emptyText) {
        container.innerHTML = '';
        if (!items.length) {
            container.classList.add('empty-state');
            container.textContent = emptyText;
            return;
        }
        container.classList.remove('empty-state');
        const preview = items.filter(Boolean).slice(0, 3).map(item => `@${escapeHtml(item.user_id)}`).join(', ');
        container.textContent = items.length > 3 ? `${preview} 외 ${items.length - 3}명` : preview;
    }

    function getManagerConfig(type) {
        const configs = {
            restricted: {
                title: '제한된 프로필',
                desc: '상대방을 차단하거나 팔로우 취소하지 않고도 교류를 제한할 수 있습니다.',
                actionLabel: '해제',
                addLabel: '제한',
                endpoint: '/api/restrict',
                items: state.currentSettings?.restricted_profiles || [],
                emptyText: '제한한 사람이 없습니다.'
            },
            blocked: {
                title: '차단된 프로필',
                desc: '프로필을 차단하고 여기서 해제하거나 새로 추가할 수 있습니다.',
                actionLabel: '차단 해제',
                addLabel: '차단',
                endpoint: '/api/block',
                items: state.currentSettings?.blocked_profiles || [],
                emptyText: '아무도 차단하지 않았습니다.'
            },
            muted: {
                title: '업데이트 안보기',
                desc: '업데이트를 보지 않도록 설정한 프로필입니다.',
                actionLabel: '해제',
                addLabel: '업데이트 안보기',
                endpoint: '/api/mute',
                items: state.currentSettings?.muted_profiles || [],
                emptyText: '업데이트를 보지 않도록 설정한 프로필이 없습니다.'
            }
        };
        return configs[type];
    }

    function renderManagerCurrentList() {
        const config = getManagerConfig(state.currentSettingsManagerType);
        if (!config) return;
        els.settingsManagerCurrentList.innerHTML = '';
        const items = config.items.filter(Boolean);
        if (!items.length) {
            els.settingsManagerCurrentList.classList.add('empty-state');
            els.settingsManagerCurrentList.textContent = config.emptyText;
            return;
        }
        els.settingsManagerCurrentList.classList.remove('empty-state');
        items.forEach(item => {
            const row = document.createElement('div');
            row.className = 'settings-profile-row';
            row.innerHTML = `
                <div class="settings-profile-summary">
                    ${avatarHtml(item, 'mini-avatar')}
                    <div>
                        <strong>${escapeHtml(item.display_name || item.user_id)}</strong>
                        <p>@${escapeHtml(item.user_id)}</p>
                    </div>
                </div>
                <button type="button" class="text-btn">${config.actionLabel}</button>
            `;
            row.querySelector('.settings-profile-summary').addEventListener('click', () => {
                closeSettings();
                openProfile(item.user_id);
            });
            row.querySelector('button').addEventListener('click', async () => {
                await toggleRelationship(config.endpoint, item.user_id);
                await reloadCurrentSettings();
                renderManagerCurrentList();
            });
            els.settingsManagerCurrentList.appendChild(row);
        });
    }

    async function searchUsersForSettings() {
        const q = els.settingsUserSearchInput.value.trim();
        if (!q) {
            els.settingsUserSearchResults.classList.add('empty-state');
            els.settingsUserSearchResults.textContent = '검색 결과가 없습니다.';
            return;
        }
        const config = getManagerConfig(state.currentSettingsManagerType);
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}&user_id=${encodeURIComponent(state.currentUserId)}`);
        if (!res.ok) return;
        const users = await res.json();
        els.settingsUserSearchResults.innerHTML = '';
        if (!users.length) {
            els.settingsUserSearchResults.classList.add('empty-state');
            els.settingsUserSearchResults.textContent = '검색 결과가 없습니다.';
            return;
        }
        els.settingsUserSearchResults.classList.remove('empty-state');
        users.forEach(user => {
            const row = document.createElement('div');
            row.className = 'settings-profile-row';
            row.innerHTML = `
                <div class="settings-profile-summary">
                    ${avatarHtml(user, 'mini-avatar')}
                    <div>
                        <strong>${escapeHtml(user.display_name || user.user_id)}</strong>
                        <p>@${escapeHtml(user.user_id)}</p>
                    </div>
                </div>
                <button type="button" class="text-btn">${config.addLabel}</button>
            `;
            row.querySelector('.settings-profile-summary').addEventListener('click', () => {
                closeSettings();
                openProfile(user.user_id);
            });
            row.querySelector('button').addEventListener('click', async () => {
                await toggleRelationship(config.endpoint, user.user_id);
                await reloadCurrentSettings();
                renderManagerCurrentList();
                await searchUsersForSettings();
            });
            els.settingsUserSearchResults.appendChild(row);
        });
    }

    async function reloadCurrentSettings() {
        if (!state.currentUserId) return;
        const res = await fetch(`/api/settings/${encodeURIComponent(state.currentUserId)}`);
        if (!res.ok) return;
        state.currentSettings = await res.json();
        fillSettingsForm();
    }

    function setSettingsView(view) {
        state.currentSettingsView = view;
        const map = {
            home: els.settingsHomeView,
            privacy: els.settingsPrivacyView,
            content: els.settingsContentView
        };
        Object.entries(map).forEach(([key, element]) => {
            if (!element) return;
            element.classList.toggle('settings-view-active', key === view);
            element.classList.toggle('settings-view-left', key !== view && (view === 'content' || view === 'privacy'));
        });
    }

    function openSettingsManager(type) {
        state.currentSettingsManagerType = type;
        const config = getManagerConfig(type);
        if (!config) return;
        els.settingsManagerTitle.textContent = config.title;
        els.settingsManagerDesc.textContent = config.desc;
        els.settingsUserSearchInput.value = '';
        els.settingsUserSearchResults.classList.add('empty-state');
        els.settingsUserSearchResults.textContent = '검색 결과가 없습니다.';
        renderManagerCurrentList();
        els.settingsManagerOverlay.classList.remove('hidden');
    }

    function closeSettingsManager() {
        state.currentSettingsManagerType = '';
        els.settingsManagerOverlay.classList.add('hidden');
    }

    async function saveSettings() {
        const data = await postData('/api/settings/update', {
            user_id: state.currentUserId,
            is_private: els.settingPrivateProfile.checked,
            mention_permission: els.settingMentionPermission.value,
            tag_permission: els.settingTagPermission.value,
            activity_visibility: els.settingActivityVisibility.value,
            hide_offensive_replies: els.settingHideOffensive.checked,
            hide_like_counts: els.settingHideLikeCounts.checked
        });
        state.currentSettings = data.settings;
        await Promise.all([loadCurrentUserData(), loadFeed(), loadNotifications()]);
        if (state.currentProfileData?.user_id === state.currentUserId) await openProfile(state.currentUserId);
        alert('설정이 저장되었습니다.');
    }

    function updateNotificationBadge(count) {
        els.notifBadge?.classList.toggle('hidden', !count);
    }

    async function markNotificationRead(notificationKey) {
        if (!notificationKey) return;
        await postData('/api/notifications/read', {
            user_id: state.currentUserId,
            notification_key: notificationKey
        });
    }

    async function markAllNotificationsRead() {
        await postData('/api/notifications/read-all', {
            user_id: state.currentUserId
        });
        await loadNotifications();
    }

    async function authorDeletePost(post) {
        if (!confirm('이 글을 삭제할까요?')) return;
        try {
            await postData(`/api/posts/${post.id}/delete`, { user_id: state.currentUserId });
            closePostDetail();
            await Promise.all([loadFeed(), loadNotifications(), openProfileIfCurrentUser()]);
            if (els.searchResults && !els.searchContent.classList.contains('hidden')) doSearch();
        } catch (error) {
            alert(error.message);
        }
    }

    async function reportTarget(type, targetId) {
        const reason = prompt('신고 사유를 적어주세요.');
        if (!reason || !reason.trim()) return;
        try {
            await postData(`/api/reports/${type}`, {
                reporter_id: state.currentUserId,
                target_id: targetId,
                reason: reason.trim()
            });
            alert('신고가 접수되었습니다.');
        } catch (error) {
            alert(error.message);
        }
    }

    async function toggleSavePost(post) {
        const data = await postData('/api/save', { post_id: post.id, user_id: state.currentUserId });
        post.is_saved = data.saved;
        return data;
    }

    function bindPostMoreMenu(root, post, options = {}) {
        const trigger = root.querySelector('.post-more-trigger');
        const menu = root.querySelector('.post-more-menu');
        if (!trigger || !menu) return;
        const closeMenu = (event) => {
            if (!menu.contains(event.target) && !trigger.contains(event.target)) {
                hideFloatingMenu(menu);
                document.removeEventListener('click', closeMenu);
            }
        };
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const willOpen = menu.classList.contains('hidden');
            document.removeEventListener('click', closeMenu);
            if (willOpen) {
                openFloatingMenu(trigger, menu);
                setTimeout(() => document.addEventListener('click', closeMenu), 0);
            } else {
                hideFloatingMenu(menu);
            }
        });
        menu.addEventListener('click', (e) => e.stopPropagation());
        root.querySelector('.post-menu-share-btn')?.addEventListener('click', async (event) => {
            try {
                const result = await sharePost(post, event.currentTarget);
                if (result === 'shared') {
                    hideFloatingMenu(menu);
                } else {
                    setTimeout(() => hideFloatingMenu(menu), 900);
                }
            } catch (error) {
                if (error.name !== 'AbortError') alert(error.message || '공유에 실패했습니다.');
            }
        });
        root.querySelector('.post-menu-save-btn')?.addEventListener('click', async () => {
            try {
                await toggleSavePost(post);
                if (options.refreshDetail) {
                    renderPostDetail(post);
                } else {
                    const iconClass = post.is_saved ? 'ph-fill ph-bookmark' : 'ph ph-bookmark';
                    root.querySelector('.post-menu-save-btn').innerHTML = `<i class="${iconClass}"></i>${post.is_saved ? '저장 취소' : '저장'}`;
                    hideFloatingMenu(menu);
                }
                await loadFeed();
            } catch (error) {
                alert(error.message);
            }
        });
        root.querySelector('.post-menu-delete-btn')?.addEventListener('click', () => authorDeletePost(post));
        root.querySelector('.post-menu-report-btn')?.addEventListener('click', () => reportTarget('post', post.id));
    }

    function bindSimpleMenu(root) {
        const trigger = root.querySelector('.post-more-trigger');
        const menu = root.querySelector('.post-more-menu');
        if (!trigger || !menu) return;
        const closeMenu = (event) => {
            if (!menu.contains(event.target) && !trigger.contains(event.target)) {
                hideFloatingMenu(menu);
                document.removeEventListener('click', closeMenu);
            }
        };
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const willOpen = menu.classList.contains('hidden');
            document.removeEventListener('click', closeMenu);
            if (willOpen) {
                openFloatingMenu(trigger, menu);
                setTimeout(() => document.addEventListener('click', closeMenu), 0);
            } else {
                hideFloatingMenu(menu);
            }
        });
        menu.addEventListener('click', (e) => e.stopPropagation());
    }

    function hideFloatingMenu(menu) {
        menu.classList.add('hidden');
        menu.classList.remove('drop-up', 'align-left', 'is-floating');
        menu.style.removeProperty('--menu-top');
        menu.style.removeProperty('--menu-left');
        menu.style.removeProperty('visibility');
        menu.style.removeProperty('pointer-events');
        restoreMenuFromPortal(menu);
    }

    function closeOtherPostMenus(currentMenu) {
        document.querySelectorAll('.post-more-menu:not(.hidden)').forEach(menu => {
            if (menu !== currentMenu) hideFloatingMenu(menu);
        });
    }

    function moveMenuToPortal(menu) {
        if (menu.parentNode === document.body) return;
        menu.__portalParent = menu.parentNode;
        menu.__portalNext = menu.nextSibling;
        document.body.appendChild(menu);
    }

    function restoreMenuFromPortal(menu) {
        const parent = menu.__portalParent;
        const next = menu.__portalNext;
        menu.__portalParent = null;
        menu.__portalNext = null;
        if (menu.parentNode !== document.body) return;
        if (parent?.isConnected) {
            parent.insertBefore(menu, next && next.parentNode === parent ? next : null);
        } else {
            menu.remove();
        }
    }

    function openFloatingMenu(trigger, menu) {
        closeOtherPostMenus(menu);
        moveMenuToPortal(menu);
        menu.classList.remove('drop-up', 'align-left');
        menu.classList.add('is-floating');
        menu.style.setProperty('--menu-top', '0px');
        menu.style.setProperty('--menu-left', '0px');
        menu.style.visibility = 'hidden';
        menu.style.pointerEvents = 'none';
        menu.classList.remove('hidden');

        const triggerRect = trigger.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();
        const margin = 14;
        const opensUp = triggerRect.bottom + 8 + menuRect.height > window.innerHeight - margin
            && triggerRect.top > menuRect.height + margin;
        const top = opensUp
            ? triggerRect.top - menuRect.height - 8
            : triggerRect.bottom + 8;
        const left = Math.min(
            Math.max(margin, triggerRect.right - menuRect.width),
            window.innerWidth - menuRect.width - margin
        );

        if (opensUp) menu.classList.add('drop-up');
        menu.style.setProperty('--menu-top', `${Math.max(margin, top)}px`);
        menu.style.setProperty('--menu-left', `${left}px`);
        menu.style.removeProperty('visibility');
        menu.style.removeProperty('pointer-events');
    }

    async function refreshCurrentDetailPost() {
        if (!state.currentDetailPost) return;
        const res = await fetch(`/api/post/${state.currentDetailPost.id}?user_id=${encodeURIComponent(state.currentUserId)}`);
        if (!res.ok) {
            closePostDetail();
            await loadFeed();
            return;
        }
        const post = await res.json();
        renderPostDetail(post);
        await loadFeed();
    }

    async function loadNotifications() {
        if (!state.currentUserId || !els.notificationsResults) return;
        const res = await fetch(`/api/notifications?user_id=${encodeURIComponent(state.currentUserId)}`);
        if (!res.ok) {
            els.notificationsResults.innerHTML = '<p class="notifications-empty">알림을 불러오지 못했습니다.</p>';
            return;
        }
        const data = await res.json();
        updateNotificationBadge(data.counts?.all || 0);
        els.notificationTabs.forEach(tab => {
            const key = tab.dataset.notificationType;
            const base = tab.dataset.baseLabel || tab.textContent.trim();
            tab.dataset.baseLabel = base;
            tab.textContent = (data.counts?.[key] || 0) > 0 ? `${base} ${data.counts[key]}` : base;
            tab.classList.toggle('active', key === state.currentNotificationTab);
        });
        const items = data[state.currentNotificationTab] || [];
        if (els.notificationsReadAllBtn) {
            els.notificationsReadAllBtn.disabled = (data.counts?.all || 0) === 0;
        }
        els.notificationsResults.innerHTML = '';
        if (!items.length) {
            els.notificationsResults.innerHTML = '<p class="notifications-empty">표시할 알림이 없습니다.</p>';
            return;
        }
        items.forEach(item => {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'notification-card';
            const label = item.category === 'mention' ? '멘션' : item.category === 'like' ? '좋아요' : item.category === 'comment' ? '댓글' : '팔로잉';
            card.innerHTML = `
                <div class="notification-card-top">
                    <div class="notification-meta">
                        <span class="notification-pill ${item.category}">${label}</span>
                        <span class="notification-actor">${escapeHtml(item.actor?.display_name || item.actor_id)}</span>
                    </div>
                    <span class="notification-time">${getTimeStr(item.created_at)}</span>
                </div>
                <div class="notification-note">${escapeHtml(item.note)}</div>
                <div class="notification-source">${renderTextWithMentions(item.source_preview || '')}</div>
                <div class="notification-post-preview">관련 글: ${renderTextWithMentions(item.post_preview || '')}</div>
            `;
            card.addEventListener('click', async () => {
                try {
                    await markNotificationRead(item.key);
                    await loadNotifications();
                    if (item.post) openPostDetail(item.post);
                } catch (error) {
                    alert(error.message);
                }
            });
            els.notificationsResults.appendChild(card);
        });
    }

    async function loadActivity() {
        if (!state.currentUserId || !els.activityResults) return;
        const params = new URLSearchParams({
            user_id: state.currentUserId,
            period: state.activityPeriod,
            start: state.activityStart || ''
        });
        const res = await fetch(`/api/activity?${params.toString()}`);
        if (!res.ok) {
            els.activityResults.innerHTML = '<div class="hook-empty">활동 정보를 불러오지 못했습니다.</div>';
            return;
        }
        const data = await res.json();
        updateActivityControls();
        els.activityResults.innerHTML = `
            ${renderActivityChart('나의 활동 그래프', data.my_activity || [])}
            ${renderActivityChart('나의 게시물 그래프', data.my_posts || [])}
        `;
        bindActivityBars();
        resetActivityChartScroll();
    }

    function updateActivityControls() {
        els.activityPeriodTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.activityPeriod === state.activityPeriod));
        els.activityBackBtn?.classList.toggle('hidden', !state.activityTrail.length);
        const labels = { day: '하루 24시간', week: '1주일 7일', month: '한달 4주', year: '1년 12달' };
        const trail = state.activityTrail.map(item => item.label).join(' / ');
        if (els.activityDrillLabel) {
            els.activityDrillLabel.textContent = trail ? `${labels[state.activityPeriod]} · ${trail}` : labels[state.activityPeriod];
        }
    }

    function renderActivityChart(title, buckets) {
        const maxValue = Math.max(1, ...buckets.flatMap(bucket => (bucket.values || []).map(item => item.value || 0)));
        const total = buckets.reduce((sum, item) => sum + (item.total || 0), 0);
        const chartClass = buckets.length <= 7 ? 'activity-column-chart centered' : 'activity-column-chart';
        return `
            <section class="activity-card">
                <div class="activity-card-head">
                    <h3>${escapeHtml(title)}</h3>
                    <span>${total.toLocaleString()} total</span>
                </div>
                <div class="${chartClass}" style="--activity-bucket-count:${Math.max(1, buckets.length)};">
                    ${buckets.map(bucket => {
                        const detail = (bucket.values || []).map(item => `<span>${escapeHtml(item.label)} ${Number(item.value || 0).toLocaleString()}</span>`).join('');
                        return `
                            <button type="button" class="activity-column" data-next-period="${escapeHtml(bucket.next_period || '')}" data-start="${escapeHtml(bucket.start || '')}" data-label="${escapeHtml(bucket.label || '')}" ${bucket.next_period ? '' : 'disabled'}>
                                <div class="activity-column-total">${Number(bucket.total || 0).toLocaleString()}</div>
                                <div class="activity-mini-bars">
                                    ${(bucket.values || []).map(item => {
                                        const value = item.value || 0;
                                        const height = Math.max(value ? 8 : 0, Math.round((value / maxValue) * 100));
                                        const metricClass = getActivityMetricClass(item.label);
                                        return `
                                            <div class="activity-mini-bar ${metricClass}" title="${escapeHtml(item.label)} ${value}">
                                                <div class="activity-mini-fill" style="height:${height}%"></div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                                <div class="activity-column-label">${escapeHtml(bucket.label)}</div>
                                <div class="activity-column-detail">${detail}</div>
                            </button>
                        `;
                    }).join('')}
                </div>
                <div class="activity-legend">
                    ${((buckets[0]?.values || []).map(item => `<span class="${getActivityMetricClass(item.label)}">${escapeHtml(item.label)}</span>`)).join('')}
                </div>
            </section>
        `;
    }

    function getActivityMetricClass(label = '') {
        if (label.includes('저장')) return 'metric-save';
        if (label.includes('댓글')) return 'metric-comment';
        if (label.includes('멘션함')) return 'metric-mention-out';
        if (label.includes('멘션받음')) return 'metric-mention-in';
        if (label.includes('좋아요')) return 'metric-like';
        return 'metric-default';
    }

    function bindActivityBars() {
        els.activityResults.querySelectorAll('.activity-column').forEach(button => {
            button.addEventListener('click', async () => {
                const nextPeriod = button.dataset.nextPeriod;
                if (!nextPeriod) return;
                state.activityTrail.push({
                    period: state.activityPeriod,
                    start: state.activityStart,
                    label: button.dataset.label || ''
                });
                state.activityPeriod = nextPeriod;
                state.activityStart = button.dataset.start || '';
                saveViewState({
                    activityPeriod: state.activityPeriod,
                    activityStart: state.activityStart
                });
                await loadActivity();
            });
        });
    }

    function resetActivityChartScroll() {
        els.activityResults.querySelectorAll('.activity-column-chart').forEach(chart => {
            chart.scrollLeft = 0;
        });
    }

    function createMetricsText(post) {
        if (post.hide_metrics) {
            return {
                likes: '<i class="ph ph-heart"></i> 숨김',
                views: '<i class="ph ph-eye"></i> 숨김'
            };
        }
        return {
            likes: `<i class="ph${post.is_liked ? '-fill' : ''} ph-heart"></i> ${post.likes}`,
            views: `<i class="ph ph-eye"></i> ${post.views || 0}`
        };
    }

    function renderPostImages(images = [], variant = 'feed') {
        const validImages = (images || []).filter(Boolean);
        if (!validImages.length) return '';
        if (validImages.length === 1) {
            return `<div class="post-image-single post-image-${variant}"><img src="${validImages[0]}" alt="게시글 이미지"></div>`;
        }
        return `
            <div class="post-image-deck post-image-${variant}" data-active-index="0" role="button" tabindex="0" aria-label="이미지 넘기기">
                ${validImages.slice(0, 2).map((src, index) => `
                    <img src="${src}" alt="게시글 이미지 ${index + 1}" class="post-deck-image ${index === 0 ? 'active' : 'behind'}" data-image-index="${index}">
                `).join('')}
                <span class="post-image-count">1 / ${validImages.length}</span>
            </div>
        `;
    }

    function bindPostImageDeck(root) {
        root.querySelectorAll('.post-image-deck').forEach(deck => {
            const shuffle = (event) => {
                event.stopPropagation();
                const images = deck.querySelectorAll('.post-deck-image');
                if (images.length < 2) return;
                const nextIndex = deck.dataset.activeIndex === '0' ? '1' : '0';
                deck.dataset.activeIndex = nextIndex;
                images.forEach(image => {
                    const active = image.dataset.imageIndex === nextIndex;
                    image.classList.toggle('active', active);
                    image.classList.toggle('behind', !active);
                });
                const count = deck.querySelector('.post-image-count');
                if (count) count.textContent = `${Number(nextIndex) + 1} / ${images.length}`;
            };
            deck.addEventListener('click', shuffle);
            deck.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    shuffle(event);
                }
            });
        });
    }

    function syncHookSourceButtons() {
        document.querySelectorAll('.hook-source-card').forEach(card => {
            const pickButton = card.querySelector('.hook-source-pick');
            const postId = Number(pickButton?.dataset.postId);
            if (!pickButton || !postId) return;
            const picked = state.hookSelectedPostMap.has(postId);
            pickButton.classList.toggle('picked', picked);
            pickButton.textContent = picked ? '담김' : '담기';
        });
    }

    function toggleHookPost(post) {
        if (!post?.id) return;
        if (state.hookSelectedPostMap.has(post.id)) {
            state.hookSelectedPostMap.delete(post.id);
        } else {
            state.hookSelectedPostMap.set(post.id, post);
        }
        syncHookSourceButtons();
        renderHookSourceList();
    }

    function createPostElement(post) {
        const postEl = document.createElement('div');
        postEl.className = 'feed-post';
        postEl.dataset.commandTarget = 'post';
        postEl.dataset.postId = post.id;
        postEl.dataset.publicId = getPostPublicId(post);
        postEl.dataset.postUrl = getPostUrl(post);
        postEl.tabIndex = 0;
        const metrics = createMetricsText(post);
        const images = renderPostImages(post.images || [], 'feed');
        const author = {
            user_id: post.author_id,
            display_name: post.author_name || post.author_id,
            profile_image: post.author_profile_image,
            initials: post.author_initials
        };
        postEl.innerHTML = `
            <div class="post-header" style="display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span class="username-link" data-uid="${escapeHtml(post.author_id)}">${avatarHtml(author, 'profile-pic-small')}</span>
                    <div class="username-link" data-uid="${escapeHtml(post.author_id)}">
                        <div class="username">${escapeHtml(post.author_name || post.author_id)}</div>
                        <div class="post-sub-id">@${escapeHtml(post.author_id)}</div>
                    </div>
                </div>
                <div class="post-header-meta">
                    <span>${getTimeStr(post.created_at)}</span>
                </div>
            </div>
            <div class="post-content">${images}${post.content ? `<div class="post-text-below-image">${renderTextWithMentions(post.content)}</div>` : ''}</div>
                <div class="post-actions">
                    <span class="like-btn ${post.is_liked ? 'liked' : ''}">${metrics.likes}</span>
                    <span><i class="ph ph-chat-circle"></i> ${(post.replies || []).length}</span>
                    <span>${metrics.views}</span>
                    <div class="post-more-menu-wrap post-actions-more">
                        <button type="button" class="post-more-trigger" aria-label="글 옵션">
                            <i class="ph ph-dots-three-vertical"></i>
                        </button>
                        <div class="post-more-menu hidden">
                            <button type="button" class="post-more-item post-menu-share-btn">
                                <i class="ph ph-share-network"></i>
                                공유
                            </button>
                            <button type="button" class="post-more-item post-menu-save-btn">
                                <i class="ph${post.is_saved ? '-fill' : ''} ph-bookmark"></i>
                                ${post.is_saved ? '저장 취소' : '저장'}
                            </button>
                            ${post.can_delete ? `
                                <button type="button" class="post-more-item danger post-menu-delete-btn">
                                    <i class="ph ph-trash"></i>
                                    글 삭제
                                </button>
                            ` : ''}
                            <button type="button" class="post-more-item post-menu-report-btn">
                                <i class="ph ph-warning-circle"></i>
                                이 글 신고하기
                            </button>
                        </div>
                    </div>
                </div>
            `;

        postEl.querySelectorAll('.username-link').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                openProfile(el.dataset.uid);
            });
        });

        postEl.querySelector('.like-btn').addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
                const data = await postData('/api/like', { post_id: post.id, user_id: state.currentUserId });
                post.is_liked = data.liked;
                post.likes = data.likes;
                const updated = createMetricsText(post);
                const btn = postEl.querySelector('.like-btn');
                btn.innerHTML = updated.likes;
                btn.classList.toggle('liked', data.liked);
                await loadNotifications();
            } catch (error) {
                alert(error.message);
            }
        });

        bindPostMoreMenu(postEl, post);
        bindPostImageDeck(postEl);

        postEl.addEventListener('click', () => openPostDetail(post));
        return postEl;
    }

    function renderDetailReplies(replies, hiddenReplyCount = 0) {
        if (!replies.length && !hiddenReplyCount) {
            els.detailReplies.innerHTML = '<p style="text-align:center; color:#737373; padding:24px 0;">아직 답글이 없습니다. 첫 답글을 남겨보세요!</p>';
            return;
        }
        els.detailReplies.innerHTML = hiddenReplyCount ? `<div class="hidden-reply-notice">숨겨진 답글 ${hiddenReplyCount}개가 있습니다. 설정에서 필터를 조정할 수 있어요.</div>` : '';
        const renderReply = (reply, depth = 0) => {
            const replyUser = { user_id: reply.author_id, display_name: reply.author_id, initials: reply.author_id.slice(0, 2).toUpperCase() };
            const item = document.createElement('div');
            item.className = 'reply-item-wrap';
            if (state.highlightedReplyId === reply.id) item.classList.add('highlighted-reply');
            item.style.marginLeft = `${Math.min(depth, 5) * 18}px`;
            item.innerHTML = `
                <div class="reply-item" style="margin-bottom:12px;">
                    <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                        ${avatarHtml(replyUser, 'mini-avatar')}
                        <span class="reply-author">${escapeHtml(reply.author_id)}</span>
                        <span style="color:#737373; font-size:11px;">${getTimeStr(reply.created_at)}</span>
                    </div>
                    <div class="reply-content" style="margin-left:30px;">${renderTextWithMentions(reply.content)}</div>
                    <div class="reply-actions">
                        <button type="button" class="reply-like-btn ${reply.is_liked ? 'liked' : ''}"><i class="ph${reply.is_liked ? '-fill' : ''} ph-heart"></i> ${reply.likes || 0}</button>
                        <button type="button" class="reply-child-btn">답글</button>
                        <div class="post-more-menu-wrap">
                            <button type="button" class="post-more-trigger reply-more-trigger" aria-label="댓글 옵션"><i class="ph ph-dots-three-vertical"></i></button>
                            <div class="post-more-menu hidden">
                                <button type="button" class="post-more-item reply-save-btn"><i class="ph${reply.is_saved ? '-fill' : ''} ph-bookmark"></i>${reply.is_saved ? '저장 취소' : '저장'}</button>
                                ${reply.can_delete ? '<button type="button" class="post-more-item danger reply-delete-btn"><i class="ph ph-trash"></i>댓글 삭제</button>' : ''}
                                <button type="button" class="post-more-item reply-report-btn"><i class="ph ph-warning-circle"></i>댓글 신고</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            els.detailReplies.appendChild(item);
            item.querySelector('.reply-like-btn')?.addEventListener('click', async () => {
                const data = await postData('/api/replies/like', { user_id: state.currentUserId, reply_id: reply.id });
                reply.is_liked = data.liked;
                reply.likes = data.likes;
                renderPostDetail(state.currentDetailPost);
            });
            item.querySelector('.reply-child-btn')?.addEventListener('click', async () => {
                const content = prompt('대댓글을 입력하세요.');
                if (!content || !content.trim()) return;
                const data = await postData('/api/replies', {
                    post_id: state.currentDetailPost.id,
                    parent_id: reply.id,
                    author_id: state.currentUserId,
                    content: content.trim()
                });
                reply.children = [...(reply.children || []), data.reply];
                renderPostDetail(state.currentDetailPost);
            });
            bindSimpleMenu(item);
            item.querySelector('.reply-save-btn')?.addEventListener('click', async () => {
                await postData('/api/replies/save', { user_id: state.currentUserId, reply_id: reply.id });
                renderPostDetail(state.currentDetailPost);
            });
            item.querySelector('.reply-delete-btn')?.addEventListener('click', async () => {
                if (!confirm('댓글을 삭제할까요?')) return;
                await postData('/api/replies/delete', { user_id: state.currentUserId, reply_id: reply.id });
                await refreshCurrentDetailPost();
            });
            item.querySelector('.reply-report-btn')?.addEventListener('click', () => reportTarget('reply', reply.id));
            (reply.children || []).forEach(child => renderReply(child, depth + 1));
        };
        replies.forEach(reply => renderReply(reply, 0));
    }

    async function openPostDetail(post, options = {}) {
        try {
            const identifier = post.id || post.public_id || getPostPublicId(post);
            const freshPost = await fetchPostByIdentifier(identifier, true);
            if (!freshPost) throw new Error('게시글을 불러오지 못했습니다.');
            renderPostDetail(freshPost);
            if (!options.skipFeedRefresh) {
                await loadFeed(false);
            }
        } catch (error) {
            if (post?.id || post?.author_id) {
                renderPostDetail(post);
            } else {
                alert(error.message || '게시글을 불러오지 못했습니다.');
            }
        }
    }

    function renderPostDetail(post) {
        state.currentDetailPost = post;
        const metrics = createMetricsText(post);
        const author = {
            user_id: post.author_id,
            display_name: post.author_name || post.author_id,
            profile_image: post.author_profile_image,
            initials: post.author_initials
        };
        const images = renderPostImages(post.images || [], 'detail');
        els.detailPostContent.innerHTML = `
            <div class="post-header" style="display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span class="username-link" data-uid="${escapeHtml(post.author_id)}">${avatarHtml(author, 'profile-pic-small')}</span>
                    <div class="username-link" data-uid="${escapeHtml(post.author_id)}">
                        <div class="username">${escapeHtml(post.author_name || post.author_id)}</div>
                        <div class="post-sub-id">@${escapeHtml(post.author_id)}</div>
                    </div>
                </div>
                <div class="post-detail-header-actions">
                    <div class="post-header-meta detail">
                        <span>${getTimeStr(post.created_at)}</span>
                    </div>
                    <div class="post-more-menu-wrap">
                        <button type="button" class="post-more-trigger" aria-label="글 옵션">
                            <i class="ph ph-dots-three-vertical"></i>
                        </button>
                        <div class="post-more-menu hidden">
                            <button type="button" class="post-more-item post-menu-share-btn">
                                <i class="ph ph-share-network"></i>
                                공유
                            </button>
                            <button type="button" class="post-more-item post-menu-save-btn">
                                <i class="ph${post.is_saved ? '-fill' : ''} ph-bookmark"></i>
                                ${post.is_saved ? '저장 취소' : '저장'}
                            </button>
                            ${post.can_delete ? `
                                <button type="button" class="post-more-item danger post-menu-delete-btn">
                                    <i class="ph ph-trash"></i>
                                    글 삭제
                                </button>
                            ` : ''}
                            <button type="button" class="post-more-item post-menu-report-btn">
                                <i class="ph ph-warning-circle"></i>
                                이 글 신고하기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="post-content" style="margin-top:12px;">${images}${post.content ? `<div class="post-text-below-image">${renderTextWithMentions(post.content)}</div>` : ''}</div>
            <div class="post-actions" style="margin-top:12px;">
                <span class="like-btn ${post.is_liked ? 'liked' : ''}">${metrics.likes}</span>
                <span><i class="ph ph-chat-circle"></i> ${(post.replies || []).length}</span>
                <span>${metrics.views}</span>
            </div>
        `;

        els.detailPostContent.querySelectorAll('.username-link').forEach(el => {
            el.addEventListener('click', () => {
                closePostDetail();
                openProfile(el.dataset.uid);
            });
        });

        els.detailPostContent.querySelector('.like-btn').addEventListener('click', async () => {
            try {
                const data = await postData('/api/like', { post_id: post.id, user_id: state.currentUserId });
                post.is_liked = data.liked;
                post.likes = data.likes;
                renderPostDetail(post);
                await Promise.all([loadFeed(), loadNotifications()]);
            } catch (error) {
                alert(error.message);
            }
        });

        bindPostMoreMenu(els.detailPostContent, post, { refreshDetail: true });
        bindPostImageDeck(els.detailPostContent);

        renderDetailReplies(post.replies || [], post.hidden_reply_count || 0);
        els.detailOverlay.classList.remove('hidden');
        els.detailReplyInput.focus();
    }

    function closePostDetail() {
        state.currentDetailPost = null;
        els.detailReplyInput.value = '';
        els.detailOverlay.classList.add('hidden');
        if (getPostPublicIdFromPath()) {
            window.history.replaceState({}, '', '/');
        }
        if (!els.feedStream?.children.length) {
            loadFeed(false);
        }
    }

    function getPostPublicIdFromPath() {
        const match = window.location.pathname.match(/^\/posts\/([^/?#]+)/);
        return match ? normalizePostIdentifier(decodeURIComponent(match[1])) : '';
    }

    async function openPostPermalinkFromCurrentUrl() {
        const publicId = getPostPublicIdFromPath();
        if (!publicId) return false;
        try {
            const post = await fetchPostByIdentifier(publicId, true);
            if (!post) throw new Error('공유된 글을 찾지 못했습니다.');
            if (post.url && window.location.pathname !== post.url) {
                window.history.replaceState({}, '', post.url);
            }
            renderPostDetail(post);
            return true;
        } catch (error) {
            console.warn(error);
            alert(error.message || '공유된 글을 불러오지 못했습니다.');
            return false;
        }
    }

    function waitForFeedImages(container = els.feedStream) {
        const images = Array.from(container?.querySelectorAll('img') || []);
        if (!images.length) return Promise.resolve();
        return Promise.all(images.map(image => {
            if (image.complete) return Promise.resolve();
            return new Promise(resolve => {
                image.addEventListener('load', resolve, { once: true });
                image.addEventListener('error', resolve, { once: true });
            });
        }));
    }

    function jumpFeedToBottom() {
        if (!els.feedContent) return;
        const scroll = () => els.feedContent.scrollTo({ top: els.feedContent.scrollHeight, behavior: 'auto' });
        requestAnimationFrame(() => {
            scroll();
            setTimeout(scroll, 120);
            waitForFeedImages().then(() => {
                requestAnimationFrame(scroll);
                setTimeout(scroll, 180);
            });
        });
    }

    function createFeedBatchLoader() {
        const loader = document.createElement('div');
        loader.className = 'feed-batch-loader';
        loader.innerHTML = `
            <div class="feed-loader-orbit">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <div>
                <strong>이전 게시물 100개 로드 중</strong>
                <p>서버에서 게시물을 가져오고 있어요.</p>
            </div>
        `;
        return loader;
    }

    async function fetchFeedPage(offset = 0) {
        const params = new URLSearchParams({
            type: state.currentFeedType,
            timeframe: state.currentPopularTime,
            user_id: state.currentUserId,
            limit: String(state.feedLimit),
            offset: String(offset),
            paged: 'true'
        });
        const res = await fetch(`/api/feed?${params.toString()}`);
        if (!res.ok) return null;
        return res.json();
    }

    async function loadOlderFeedBatch() {
        if (!state.currentUserId || state.currentFeedType !== 'latest') return;
        if (state.feedLoadingMore || !state.feedHasMore) return;
        state.feedLoadingMore = true;
        const beforeHeight = els.feedContent.scrollHeight;
        const loader = createFeedBatchLoader();
        els.feedStream.prepend(loader);
        try {
            const data = await fetchFeedPage(state.feedOffset);
            loader.classList.add('done');
            setTimeout(() => loader.remove(), 240);
            const posts = data?.posts || [];
            if (posts.length) {
                const fragment = document.createDocumentFragment();
                posts.forEach(post => fragment.appendChild(createPostElement(post)));
                els.feedStream.prepend(fragment);
                state.feedOffset = data.next_offset;
                state.feedHasMore = data.has_more;
                await waitForFeedImages(els.feedStream);
                const afterHeight = els.feedContent.scrollHeight;
                els.feedContent.scrollTop += afterHeight - beforeHeight;
            } else {
                state.feedHasMore = false;
            }
        } finally {
            state.feedLoadingMore = false;
        }
    }

    async function loadFeed(jumpToLatest = false) {
        if (!state.currentUserId) return;
        if (state.openingPermalink) return;
        state.feedOffset = 0;
        state.feedHasMore = false;
        state.feedLoadingMore = false;
        const data = await fetchFeedPage(0);
        if (!data) return;
        const posts = data.posts || [];
        state.feedOffset = data.next_offset || posts.length;
        state.feedHasMore = Boolean(data.has_more);
        els.feedStream.innerHTML = '';
        if (!posts.length) {
            els.feedStream.innerHTML = '<p style="text-align:center; color:#737373;">게시물이 없습니다.</p>';
            return;
        }
        posts.forEach(post => els.feedStream.appendChild(createPostElement(post)));
        if (state.currentFeedType === 'latest' && jumpToLatest) {
            jumpFeedToBottom();
        }
    }

    function handleFeedScroll() {
        if (!els.feedContent || els.feedContent.classList.contains('hidden')) return;
        if (state.currentFeedType !== 'latest') return;
        if (els.feedContent.scrollTop <= 160) {
            loadOlderFeedBatch();
        }
    }

    async function doSearch() {
        const query = els.searchInput.value.trim();
        if (!query) return;
        const [postsRes, usersRes] = await Promise.all([
            fetch(`/api/search?q=${encodeURIComponent(query)}&user_id=${encodeURIComponent(state.currentUserId)}`),
            fetch(`/api/users/search?q=${encodeURIComponent(query)}&user_id=${encodeURIComponent(state.currentUserId)}&include_self=true`)
        ]);
        if (!postsRes.ok || !usersRes.ok) return;
        const posts = await postsRes.json();
        const users = await usersRes.json();
        els.searchResults.innerHTML = '';
        if (!posts.length && !users.length) {
            els.searchResults.innerHTML = '<p style="text-align:center; color:#737373;">검색 결과가 없습니다.</p>';
            return;
        }
        if (users.length) {
            const userSection = document.createElement('section');
            userSection.className = 'search-section';
            userSection.innerHTML = '<h3>사용자</h3>';
            const userList = document.createElement('div');
            userList.className = 'search-user-list';
            users.forEach(user => userList.appendChild(createSearchUserElement(user)));
            userSection.appendChild(userList);
            els.searchResults.appendChild(userSection);
        }
        if (posts.length) {
            const postSection = document.createElement('section');
            postSection.className = 'search-section';
            postSection.innerHTML = '<h3>게시글</h3>';
            posts.forEach(post => postSection.appendChild(createPostElement(post)));
            els.searchResults.appendChild(postSection);
        }
    }

    function createSearchUserElement(user) {
        const row = document.createElement('button');
        row.type = 'button';
        row.className = 'search-user-card';
        row.innerHTML = `
            ${avatarHtml(user, 'search-user-avatar')}
            <div class="search-user-copy">
                <strong>${escapeHtml(user.display_name || user.user_id)}</strong>
                <span>@${escapeHtml(user.user_id)}</span>
            </div>
            <i class="ph ph-caret-right"></i>
        `;
        row.addEventListener('click', () => openProfile(user.user_id));
        return row;
    }

    function getHookSourcePosts() {
        const sorters = {
            top_liked: (a, b) => (b.likes || 0) - (a.likes || 0),
            top_viewed: (a, b) => (b.views || 0) - (a.views || 0)
        };
        let posts = [];
        if (state.currentHookSource === 'all') posts = state.hookGlobalResults || [];
        else if (state.currentHookSource === 'selected') posts = Array.from(state.hookSelectedPostMap.values());
        else posts = state.hookSources[state.currentHookSource] || [];
        if (state.currentHookSource === 'top_liked') posts = posts.filter(post => (post.likes || 0) >= 1);
        if (state.currentHookSource === 'top_viewed') posts = posts.filter(post => (post.views || 0) >= 1);
        if (sorters[state.currentHookSource]) posts = [...posts].sort(sorters[state.currentHookSource]);
        const query = state.hookSourceQuery.trim().toLowerCase();
        if (!query || state.currentHookSource === 'all') return posts;
        return posts.filter(post => {
            const target = `${post.content || ''} ${post.author_name || ''} ${post.author_id || ''}`.toLowerCase();
            return target.includes(query);
        });
    }

    function getHookSourceLabel(source) {
        const labels = {
            all: '전체 검색',
            selected: '선택한 글',
            liked: '좋아요 누른 글',
            saved: '저장한 글',
            top_liked: '좋아요 많은 내 글',
            top_viewed: '조회수 많은 내 글'
        };
        return labels[source] || '선택한 글';
    }

    function setHookView(view) {
        state.currentHookView = view || 'books';
        els.hookViewTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.hookView === state.currentHookView));
        els.hookPanels.forEach(panel => panel.classList.toggle('hidden', panel.dataset.hookPanel !== state.currentHookView));
        saveViewState({ hookView: state.currentHookView });
    }

    function openHookBuilder(book = null) {
        if (book) {
            state.currentHookBookId = book.id;
            state.currentHookSource = book.source_type || 'selected';
            state.hookSelectedPostMap = new Map((book.posts || []).map(post => [post.id, post]));
            els.hookBookTitleInput.value = book.title;
            els.hookSaveBookBtn.textContent = '책 수정 저장';
        } else {
            state.currentHookBookId = null;
            state.currentHookSource = 'selected';
            state.hookSelectedPostMap = new Map();
            els.hookBookTitleInput.value = '';
            els.hookSaveBookBtn.textContent = '책 저장';
        }
        state.hookSourceQuery = '';
        state.hookGlobalResults = [];
        els.hookPostSearchInput.value = '';
        els.hookPostSearchResults.innerHTML = '';
        renderHookSourceList();
        els.hookBuilderOverlay.classList.remove('hidden');
    }

    function closeHookBuilder() {
        els.hookBuilderOverlay.classList.add('hidden');
    }

    async function loadHookSources() {
        const res = await fetch(`/api/hook/sources?user_id=${encodeURIComponent(state.currentUserId)}`);
        if (!res.ok) return;
        state.hookSources = await res.json();
        renderHookSourceList();
    }

    async function loadHookBooksAndOrders() {
        const [booksRes, ordersRes] = await Promise.all([
            fetch(`/api/hook/books?user_id=${encodeURIComponent(state.currentUserId)}`),
            fetch(`/api/hook/orders?user_id=${encodeURIComponent(state.currentUserId)}`)
        ]);
        state.hookBooks = booksRes.ok ? await booksRes.json() : [];
        state.hookOrders = ordersRes.ok ? await ordersRes.json() : [];
        renderHookBooks();
        renderHookOrders();
    }

    async function loadHookDashboard() {
        await Promise.all([loadHookSources(), loadHookBooksAndOrders()]);
    }

    function createHookSearchResultCard(post) {
        const row = document.createElement('div');
        row.className = 'hook-source-card';
        const picked = state.hookSelectedPostMap.has(post.id);
        row.innerHTML = `
            <button type="button" class="hook-source-main">
                <div class="hook-source-topline">
                    <strong>${escapeHtml(post.author_name || post.author_id)} <span>@${escapeHtml(post.author_id)}</span></strong>
                    <time>${getTimeStr(post.created_at)}</time>
                </div>
                <p>${renderTextWithMentions(post.content || '이미지 게시물')}</p>
                <small><i class="ph ph-heart"></i> ${post.likes} · <i class="ph ph-eye"></i> ${post.views || 0} · 댓글 ${(post.replies || []).length}</small>
            </button>
            <button type="button" class="hook-source-pick ${picked ? 'picked' : ''}" data-post-id="${post.id}">${picked ? '담김' : '담기'}</button>
        `;
        row.querySelector('.hook-source-main').addEventListener('click', () => openPostDetail(post));
        row.querySelector('.hook-source-pick').addEventListener('click', () => toggleHookPost(post));
        return row;
    }

    async function searchPostsForHook() {
        const query = els.hookPostSearchInput.value.trim();
        state.hookSourceQuery = query;
        els.hookPostSearchResults.innerHTML = '';
        if (state.currentHookSource !== 'all') {
            renderHookSourceList();
            return;
        }
        if (!query) {
            state.hookGlobalResults = [];
            renderHookSourceList();
            return;
        }
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&user_id=${encodeURIComponent(state.currentUserId)}`);
        if (!res.ok) return;
        state.hookGlobalResults = await res.json();
        renderHookSourceList();
    }

    function renderHookSourceList() {
        if (!els.hookSourceList) return;
        const posts = getHookSourcePosts();
        els.hookSourceTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.hookSource === state.currentHookSource));
        els.hookSourceList.innerHTML = '';
        if (!posts.length) {
            const queryText = state.hookSourceQuery ? '검색 결과가 없습니다.' : `${getHookSourceLabel(state.currentHookSource)}이 없습니다.`;
            els.hookSourceList.innerHTML = `
                <div class="hook-empty">
                    <strong>${queryText}</strong>
                    <span>${state.currentHookSource === 'all' ? '전체 검색어를 입력해서 책에 담을 글을 찾으세요.' : '이 탭에 있는 글 안에서 검색하거나 다른 탭을 확인해보세요.'}</span>
                </div>
            `;
            return;
        }
        posts.forEach(post => {
            els.hookSourceList.appendChild(createHookSearchResultCard(post));
        });
    }

    function renderHookBooks() {
        if (!els.hookBooksList) return;
        els.hookBooksList.innerHTML = '';
        if (!state.hookBooks.length) {
            els.hookBooksList.innerHTML = '<div class="hook-empty">아직 저장된 책이 없습니다.</div>';
            return;
        }
        state.hookBooks.forEach(book => {
            const card = document.createElement('article');
            card.className = 'hook-book-card';
            card.innerHTML = `
                <div class="hook-book-card-top">
                    <div>
                        <span class="hook-status">${escapeHtml(book.status)}</span>
                        <h4>${escapeHtml(book.title)}</h4>
                        <p>글 ${book.posts.length}개</p>
                    </div>
                </div>
                <div class="hook-book-preview">${book.posts.slice(0, 2).map(post => `<span>${escapeHtml(makeClientPreview(post.content || '이미지 게시물', 54))}</span>`).join('')}</div>
                <div class="hook-book-actions">
                    <button type="button" class="text-btn hook-load-book-btn">편집</button>
                    <button type="button" class="text-btn hook-order-book-btn">주문하기</button>
                </div>
            `;
            card.querySelector('.hook-load-book-btn').addEventListener('click', () => {
                openHookBuilder(book);
            });
            card.querySelector('.hook-order-book-btn').addEventListener('click', async () => {
                try {
                    await postData('/api/hook/orders', { user_id: state.currentUserId, book_id: book.id, memo: 'HOOK에서 기록한 주문입니다.' });
                    await loadHookBooksAndOrders();
                    setHookView('orders');
                } catch (error) {
                    alert(error.message);
                }
            });
            els.hookBooksList.appendChild(card);
        });
    }

    function renderHookOrders() {
        if (!els.hookOrdersList) return;
        els.hookOrdersList.innerHTML = '';
        if (!state.hookOrders.length) {
            els.hookOrdersList.innerHTML = '<div class="hook-empty">아직 주문 기록이 없습니다.</div>';
            return;
        }
        state.hookOrders.forEach(order => {
            const card = document.createElement('article');
            card.className = 'hook-order-card';
            card.innerHTML = `
                <div>
                    <span class="hook-status">${escapeHtml(order.status)}</span>
                    <h4>${escapeHtml(order.book?.title || `HOOK 책 #${order.book_id}`)}</h4>
                    <p>주문 #${order.id} · ${new Date(`${order.created_at}Z`).toLocaleString()}</p>
                </div>
                ${['pending', 'processing'].includes(order.status) ? '<button type="button" class="text-btn hook-cancel-order-btn">주문취소</button>' : ''}
            `;
            card.querySelector('.hook-cancel-order-btn')?.addEventListener('click', async () => {
                if (!confirm('주문을 취소할까요?')) return;
                try {
                    await postData(`/api/hook/orders/${order.id}/cancel`, { user_id: state.currentUserId });
                    await loadHookBooksAndOrders();
                } catch (error) {
                    alert(error.message);
                }
            });
            els.hookOrdersList.appendChild(card);
        });
    }

    function makeClientPreview(value = '', limit = 80) {
        const compact = String(value).replace(/\s+/g, ' ').trim();
        return compact.length <= limit ? compact : `${compact.slice(0, limit - 1)}…`;
    }

    async function saveHookBook() {
        const posts = Array.from(state.hookSelectedPostMap.values());
        if (!posts.length) {
            alert('책에 담을 글을 먼저 선택해주세요.');
            return;
        }
        try {
            const payload = {
                user_id: state.currentUserId,
                title: els.hookBookTitleInput.value.trim() || `${getHookSourceLabel(state.currentHookSource)} 책`,
                source_type: state.currentHookSource,
                post_ids: posts.map(post => post.id)
            };
            const data = state.currentHookBookId
                ? await jsonData(`/api/hook/books/${state.currentHookBookId}`, payload, 'PATCH')
                : await postData('/api/hook/books', payload);
            state.currentHookBookId = data.book.id;
            els.hookBookTitleInput.value = data.book.title;
            els.hookSaveBookBtn.textContent = '책 수정 저장';
            await loadHookBooksAndOrders();
            closeHookBuilder();
            setHookView('books');
        } catch (error) {
            alert(error.message);
        }
    }

    async function loadAdminPosts() {
        if (!state.adminToken || !els.adminPostsList) return;
        const q = els.adminPostSearchInput.value.trim();
        const res = await fetch(`/api/admin/posts?token=${encodeURIComponent(state.adminToken)}&q=${encodeURIComponent(q)}`);
        if (!res.ok) {
            els.adminPostsList.innerHTML = '<div class="hook-empty">관리자 로그인이 필요합니다.</div>';
            return;
        }
        const posts = await res.json();
        els.adminPostsList.innerHTML = '';
        if (!posts.length) {
            els.adminPostsList.innerHTML = '<div class="hook-empty">관리할 글이 없습니다.</div>';
            return;
        }
        posts.forEach(post => {
            const row = document.createElement('article');
            row.className = 'admin-row';
            const publicId = getPostPublicId(post);
            row.innerHTML = `
                <div class="admin-row-main">
                    <div class="admin-row-title">#${post.id} · ${escapeHtml(publicId)} @${escapeHtml(post.author_id)}</div>
                    <p>${renderTextWithMentions(post.content || '이미지 게시물')}</p>
                    <small>좋아요 ${post.likes} · 조회 ${post.views} · 댓글 ${post.reply_count} · ${getTimeStr(post.created_at)}</small>
                    <div class="admin-badges">
                        ${post.author_deleted ? '<span>글쓴이 삭제됨</span>' : '<span>게시중</span>'}
                        ${post.admin_deleted ? '<span class="danger">관리자 삭제됨</span>' : ''}
                    </div>
                </div>
                <button type="button" class="admin-danger-btn" ${post.admin_deleted ? 'disabled' : ''}>관리자 삭제</button>
            `;
            row.querySelector('.admin-row-main')?.addEventListener('click', () => openAdminPostDetail(post));
            row.querySelector('.admin-danger-btn')?.addEventListener('click', async () => {
                if (!confirm('관리자 권한으로 이 글을 삭제 처리할까요?')) return;
                try {
                    await postData(`/api/admin/posts/${post.id}/delete`, { token: state.adminToken });
                    await loadAdminPosts();
                } catch (error) {
                    alert(error.message);
                }
            });
            els.adminPostsList.appendChild(row);
        });
    }

    function openAdminPostDetail(post, highlightedReply = null) {
        if (!els.adminPostDetailOverlay) return;
        els.adminDetailTitle.textContent = `#${post.id} · ${getPostPublicId(post)} @${post.author_id}`;
        const images = renderPostImages(post.images || [], 'detail');
        const highlightedReplyId = highlightedReply?.id || 0;
        els.adminDetailBody.innerHTML = `
            <div class="admin-detail-meta">
                <span>${getTimeStr(post.created_at)}</span>
                <span>좋아요 ${post.likes}</span>
                <span>조회 ${post.views}</span>
                <span>댓글 ${post.reply_count}</span>
            </div>
            <div class="admin-detail-status">
                ${post.author_deleted ? '<span>글쓴이 삭제됨</span>' : '<span>게시중</span>'}
                ${post.admin_deleted ? '<span class="danger">관리자 삭제됨</span>' : ''}
            </div>
            ${images}
            <div class="admin-detail-content">${renderTextWithMentions(post.content || '이미지 게시물')}</div>
            <div class="admin-detail-replies">
                <div class="admin-detail-section-title">댓글 ${post.reply_count || 0}</div>
                <div id="admin-detail-reply-tree"></div>
            </div>
        `;
        bindPostImageDeck(els.adminDetailBody);
        const replyTree = els.adminDetailBody.querySelector('#admin-detail-reply-tree');
        renderAdminDetailReplies(replyTree, post.replies || [], highlightedReplyId);
        if (highlightedReplyId && !replyTree.querySelector(`[data-admin-reply-id="${highlightedReplyId}"]`)) {
            replyTree.insertAdjacentHTML('afterbegin', `
                <div class="admin-detail-reply highlighted-admin-reply">
                    <strong>신고된 댓글 #${highlightedReply.id} · @${escapeHtml(highlightedReply.author_id)}</strong>
                    <p>${renderTextWithMentions(highlightedReply.content)}</p>
                    <span>원본 댓글이 삭제 상태라 별도로 표시했습니다.</span>
                </div>
            `);
        }
        els.adminPostDetailOverlay.classList.remove('hidden');
    }

    function renderAdminDetailReplies(container, replies, highlightedReplyId, depth = 0) {
        if (!container) return;
        if (!replies.length && depth === 0) {
            container.innerHTML = '<div class="hook-empty compact">댓글이 없습니다.</div>';
            return;
        }
        replies.forEach(reply => {
            const item = document.createElement('div');
            item.className = 'admin-detail-reply';
            if (reply.id === highlightedReplyId) item.classList.add('highlighted-admin-reply');
            item.dataset.adminReplyId = reply.id;
            item.style.marginLeft = `${Math.min(depth, 5) * 18}px`;
            item.innerHTML = `
                <div class="admin-detail-reply-head">
                    <strong>#${reply.id} @${escapeHtml(reply.author_id)}</strong>
                    <span>${getTimeStr(reply.created_at)} · 좋아요 ${reply.likes || 0}</span>
                </div>
                <p>${renderTextWithMentions(reply.content)}</p>
                <div class="admin-badges">
                    ${reply.author_deleted ? '<span>작성자 삭제됨</span>' : '<span>게시중</span>'}
                    ${reply.admin_deleted ? '<span class="danger">관리자 삭제됨</span>' : ''}
                    ${reply.id === highlightedReplyId ? '<span class="report">신고된 댓글</span>' : ''}
                </div>
            `;
            container.appendChild(item);
            renderAdminDetailReplies(container, reply.children || [], highlightedReplyId, depth + 1);
        });
    }

    function closeAdminPostDetail() {
        els.adminPostDetailOverlay?.classList.add('hidden');
    }

    async function loadAdminOrders() {
        if (!state.adminToken || !els.adminOrdersList) return;
        const q = els.adminOrderSearchInput.value.trim();
        const res = await fetch(`/api/admin/orders?token=${encodeURIComponent(state.adminToken)}&q=${encodeURIComponent(q)}`);
        if (!res.ok) {
            els.adminOrdersList.innerHTML = '<div class="hook-empty">관리자 로그인이 필요합니다.</div>';
            return;
        }
        const orders = await res.json();
        els.adminOrdersList.innerHTML = '';
        if (!orders.length) {
            els.adminOrdersList.innerHTML = '<div class="hook-empty">주문 정보가 없습니다.</div>';
            return;
        }
        orders.forEach(order => {
            const row = document.createElement('article');
            row.className = 'admin-row';
            row.innerHTML = `
                <div class="admin-row-main">
                    <div class="admin-row-title">주문 #${order.id} · ${escapeHtml(order.book_title)}</div>
                    <p>@${escapeHtml(order.user_id)} · 책 #${order.book_id}</p>
                    <small>생성 ${new Date(`${order.created_at}Z`).toLocaleString()} · 수정 ${new Date(`${order.updated_at}Z`).toLocaleString()}</small>
                </div>
                <div class="admin-order-actions">
                    <button type="button" class="admin-export-btn">파트너 JSON</button>
                    <select class="admin-status-select">
                        <option value="pending">pending</option>
                        <option value="processing">processing</option>
                        <option value="completed">completed</option>
                        <option value="cancelled">cancelled</option>
                    </select>
                </div>
            `;
            const select = row.querySelector('.admin-status-select');
            select.value = order.status;
            select.addEventListener('change', async () => {
                try {
                    await postData(`/api/admin/orders/${order.id}/status`, { token: state.adminToken, status: select.value });
                    await loadAdminOrders();
                } catch (error) {
                    alert(error.message);
                }
            });
            row.querySelector('.admin-export-btn')?.addEventListener('click', async () => {
                try {
                    const res = await fetch(`/api/admin/orders/${order.id}/partner-export?token=${encodeURIComponent(state.adminToken)}`);
                    const payload = await res.json();
                    if (!res.ok) throw new Error(payload.detail || '파트너 JSON을 만들지 못했습니다.');
                    downloadJsonFile(`hook-order-${order.id}-partner-export.json`, payload);
                } catch (error) {
                    alert(error.message);
                }
            });
            els.adminOrdersList.appendChild(row);
        });
    }

    async function loadAdminReports() {
        if (!state.adminToken || !els.adminReportsList) return;
        const res = await fetch(`/api/admin/reports?token=${encodeURIComponent(state.adminToken)}`);
        const reports = res.ok ? await res.json() : [];
        els.adminReportsList.innerHTML = '';
        if (!reports.length) {
            els.adminReportsList.innerHTML = '<div class="hook-empty">접수된 글/댓글 신고가 없습니다.</div>';
            return;
        }
        reports.forEach(report => {
            const row = document.createElement('article');
            row.className = 'admin-row';
            const isReply = report.target_type === 'reply';
            const post = isReply ? report.target?.post : report.target;
            row.innerHTML = `
                <div class="admin-row-main">
                    <div class="admin-row-title">${isReply ? '댓글 신고' : '글 신고'} #${report.id}</div>
                    <p>신고자 @${escapeHtml(report.reporter_id)} · 사유: ${escapeHtml(report.reason || '사유 없음')}</p>
                    <small>${getTimeStr(report.created_at)} · ${isReply ? `원본 글 #${report.target?.post_id || ''} / 댓글 #${report.target_id}` : `글 #${report.target_id}`}</small>
                </div>
            `;
            row.querySelector('.admin-row-main')?.addEventListener('click', () => {
                if (post) openAdminPostDetail(post, isReply ? report.target : null);
            });
            els.adminReportsList.appendChild(row);
        });
    }

    async function loadAdminBugReports() {
        if (!state.adminToken || !els.adminBugReportsList) return;
        const res = await fetch(`/api/admin/bug-reports?token=${encodeURIComponent(state.adminToken)}`);
        const reports = res.ok ? await res.json() : [];
        els.adminBugReportsList.innerHTML = '';
        if (!reports.length) {
            els.adminBugReportsList.innerHTML = '<div class="hook-empty">접수된 버그 신고가 없습니다.</div>';
            return;
        }
        reports.forEach(report => {
            const row = document.createElement('article');
            row.className = 'admin-row';
            const images = (report.images || []).map(src => `<img src="${src}" alt="버그 신고 첨부">`).join('');
            row.innerHTML = `
                <div class="admin-row-main">
                    <div class="admin-row-title">#${report.id} ${escapeHtml(report.title)}</div>
                    <p>${escapeHtml(report.content || '내용 없음')}</p>
                    <small>신고자 @${escapeHtml(report.reporter_id)} · ${getTimeStr(report.created_at)} · 이미지 ${(report.images || []).length}장</small>
                    ${images ? `<div class="admin-bug-thumbs">${images}</div>` : ''}
                </div>
            `;
            els.adminBugReportsList.appendChild(row);
        });
    }

    async function initializeAdminExperience() {
        if (!state.adminToken) {
            navigateTo('adminLogin');
            return;
        }
        navigateTo('admin');
        setAdminView(state.currentAdminView);
        await Promise.all([loadAdminPosts(), loadAdminOrders(), loadAdminReports(), loadAdminBugReports()]);
    }

    async function toggleRelationship(endpoint, targetId) {
        const data = await postData(endpoint, { user_id: state.currentUserId, target_id: targetId });
        await Promise.all([loadNotifications(), loadFeed(), reloadCurrentSettings(), loadCurrentUserData()]);
        if (state.currentProfileData && state.currentProfileData.user_id === targetId) await openProfile(targetId);
        return data;
    }

    function renderProfileHeader(profile) {
        const self = profile.is_own_profile;
        const relationship = profile.relationship || {};
        const actions = self ? `
            <div class="profile-action-row">
                <button type="button" class="profile-action-btn" id="edit-profile-btn">프로필 수정</button>
                <button type="button" class="profile-action-btn secondary" id="open-settings-from-profile-btn">프로필 공개범위</button>
            </div>
        ` : `
            <div class="profile-action-row">
                <button type="button" class="profile-action-btn" id="follow-profile-btn">${relationship.is_following ? '팔로잉' : '팔로우'}</button>
                <div class="profile-more-menu-wrap">
                    <button type="button" class="profile-more-trigger" id="profile-more-trigger" aria-label="더 보기">
                        <i class="ph ph-dots-three-vertical"></i>
                    </button>
                    <div class="profile-more-menu hidden" id="profile-more-menu">
                        <button type="button" class="profile-more-item" id="mute-profile-btn">${relationship.is_muted ? '업데이트 보기' : '업데이트 안보기'}</button>
                        <button type="button" class="profile-more-item" id="restrict-profile-btn">${relationship.is_restricted ? '제한 해제' : '제한'}</button>
                        <button type="button" class="profile-more-item danger" id="block-profile-btn">${relationship.is_blocked ? '차단 해제' : '차단'}</button>
                    </div>
                </div>
            </div>
        `;
        const interestsHtml = (profile.interests || []).length ? `
            <div class="tag-list">
                ${(profile.interests || []).map(item => `<span class="interest-chip">${escapeHtml(item)}</span>`).join('')}
            </div>
        ` : '';
        const lockMessage = profile.relationship?.blocked_you ? '<p class="profile-lock-message">이 사용자가 회원님을 차단했습니다.</p>' :
            (!profile.can_view_content ? '<p class="profile-lock-message">비공개 프로필입니다. 팔로우하면 게시물을 볼 수 있어요.</p>' : '');
        els.profileInfo.innerHTML = `
            ${avatarHtml(profile, 'profile-avatar', true)}
            <div class="profile-info-body">
                <div class="profile-identity">
                    <div class="profile-username">${escapeHtml(profile.display_name || profile.user_id)}</div>
                    <div class="profile-handle">@${escapeHtml(profile.user_id)}</div>
                </div>
                <div class="profile-stats">
                    <div class="profile-stat"><span class="stat-num">${profile.post_count}</span><span class="stat-label">게시물</span></div>
                    <div class="profile-stat"><span class="stat-num">${profile.follower_count}</span><span class="stat-label">팔로워</span></div>
                    <div class="profile-stat"><span class="stat-num">${profile.following_count}</span><span class="stat-label">팔로잉</span></div>
                </div>
                <div class="profile-bio">${profile.bio ? renderTextWithMentions(profile.bio) : '<span class="profile-muted">소개가 없습니다.</span>'}</div>
                ${interestsHtml}
                ${lockMessage}
                ${actions}
            </div>
        `;

        if (self) {
            document.getElementById('edit-profile-btn')?.addEventListener('click', openProfileEdit);
            document.getElementById('open-settings-from-profile-btn')?.addEventListener('click', () => {
                closeProfile();
                openSettings('privacy');
            });
        } else {
            document.getElementById('follow-profile-btn')?.addEventListener('click', async () => {
                try {
                    await toggleRelationship('/api/follow', profile.user_id);
                    await openProfile(profile.user_id);
                } catch (error) {
                    alert(error.message);
                }
            });
            document.getElementById('mute-profile-btn')?.addEventListener('click', async () => {
                try {
                    await toggleRelationship('/api/mute', profile.user_id);
                    await openProfile(profile.user_id);
                } catch (error) {
                    alert(error.message);
                }
            });
            document.getElementById('restrict-profile-btn')?.addEventListener('click', async () => {
                try {
                    await toggleRelationship('/api/restrict', profile.user_id);
                    await openProfile(profile.user_id);
                } catch (error) {
                    alert(error.message);
                }
            });
            document.getElementById('block-profile-btn')?.addEventListener('click', async () => {
                try {
                    await toggleRelationship('/api/block', profile.user_id);
                    await openProfile(profile.user_id);
                } catch (error) {
                    alert(error.message);
                }
            });
            const moreTrigger = document.getElementById('profile-more-trigger');
            const moreMenu = document.getElementById('profile-more-menu');
            if (moreTrigger && moreMenu) {
                const closeMenu = (event) => {
                    if (!moreMenu.contains(event.target) && !moreTrigger.contains(event.target)) {
                        moreMenu.classList.add('hidden');
                        document.removeEventListener('click', closeMenu);
                    }
                };
                moreTrigger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const willOpen = moreMenu.classList.contains('hidden');
                    moreMenu.classList.toggle('hidden');
                    document.removeEventListener('click', closeMenu);
                    if (willOpen) {
                        setTimeout(() => document.addEventListener('click', closeMenu), 0);
                    }
                });
            }
        }
    }

    async function openProfile(userId) {
        const res = await fetch(`/api/profile/${encodeURIComponent(userId)}?viewer_id=${encodeURIComponent(state.currentUserId)}`);
        if (!res.ok) return;
        state.currentProfileData = await res.json();
        state.currentProfileTab = 'posts';
        renderProfileHeader(state.currentProfileData);
        els.profileSavesTab.style.display = state.currentProfileData.is_own_profile ? 'block' : 'none';
        els.profileTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.tab === 'posts'));
        await renderProfileTab('posts');
        els.profileOverlay.classList.remove('hidden');
    }

    async function renderProfileTab(tab) {
        if (!state.currentProfileData) return;
        state.currentProfileTab = tab;
        els.profileTabs.forEach(button => button.classList.toggle('active', button.dataset.tab === tab));
        els.profileContent.innerHTML = '';

        if (!state.currentProfileData.can_view_content && !state.currentProfileData.is_own_profile) {
            els.profileContent.innerHTML = '<p style="text-align:center; color:#737373; padding:24px 0;">이 프로필의 게시물을 볼 수 없습니다.</p>';
            return;
        }

        if (tab === 'posts') {
            if (!state.currentProfileData.posts.length) {
                els.profileContent.innerHTML = '<p style="text-align:center; color:#737373; padding:24px 0;">작성한 글이 없습니다.</p>';
                return;
            }
            state.currentProfileData.posts.forEach(post => els.profileContent.appendChild(createPostElement(post)));
            return;
        }

        if (tab === 'liked') {
            const likedPosts = state.currentProfileData.liked_posts || [];
            const likedReplies = state.currentProfileData.liked_replies || [];
            if (!likedPosts.length && !likedReplies.length) {
                els.profileContent.innerHTML = '<p style="text-align:center; color:#737373; padding:24px 0;">좋아요한 글이나 댓글이 없습니다.</p>';
                return;
            }
            likedPosts.forEach(post => els.profileContent.appendChild(createPostElement(post)));
            likedReplies.forEach(item => {
                const row = document.createElement('button');
                row.type = 'button';
                row.className = 'saved-reply-card liked-reply-card';
                row.innerHTML = `
                    <strong>좋아요한 댓글 · @${escapeHtml(item.reply.author_id)}</strong>
                    <p>${renderTextWithMentions(item.reply.content)}</p>
                    <span>원본 글: ${escapeHtml(makeClientPreview(item.post.content || '이미지 게시물', 60))}</span>
                `;
                row.addEventListener('click', () => {
                    closeProfile();
                    state.highlightedReplyId = item.reply.id;
                    openPostDetail(item.post);
                });
                els.profileContent.appendChild(row);
            });
            return;
        }

        if (tab === 'saves') {
            const res = await fetch(`/api/saves?user_id=${encodeURIComponent(state.currentProfileData.user_id)}&requesting_user_id=${encodeURIComponent(state.currentUserId)}`);
            const data = res.ok ? await res.json() : { posts: [], replies: [] };
            const posts = Array.isArray(data) ? data : (data.posts || []);
            const replies = Array.isArray(data) ? [] : (data.replies || []);
            if (!posts.length && !replies.length) {
                els.profileContent.innerHTML = '<p style="text-align:center; color:#737373; padding:24px 0;">저장된 글이 없습니다.</p>';
                return;
            }
            posts.forEach(post => els.profileContent.appendChild(createPostElement(post)));
            replies.forEach(item => {
                const row = document.createElement('button');
                row.type = 'button';
                row.className = 'saved-reply-card';
                row.innerHTML = `
                    <strong>저장한 댓글 · @${escapeHtml(item.reply.author_id)}</strong>
                    <p>${renderTextWithMentions(item.reply.content)}</p>
                    <span>원본 글: ${escapeHtml(makeClientPreview(item.post.content || '이미지 게시물', 60))}</span>
                `;
                row.addEventListener('click', () => {
                    closeProfile();
                    state.highlightedReplyId = item.reply.id;
                    openPostDetail(item.post);
                });
                els.profileContent.appendChild(row);
            });
            return;
        }

        if (!state.currentProfileData.images.length) {
            els.profileContent.innerHTML = '<p style="text-align:center; color:#737373; padding:24px 0;">업로드한 이미지가 없습니다.</p>';
            return;
        }
        const grid = document.createElement('div');
        grid.className = 'profile-image-grid';
        state.currentProfileData.images.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            img.alt = '이미지';
            grid.appendChild(img);
        });
        els.profileContent.appendChild(grid);
    }

    function closeProfile() {
        state.currentProfileData = null;
        els.profileOverlay.classList.add('hidden');
    }

    function openProfileEdit() {
        if (!state.currentUser) return;
        els.profileDisplayNameInput.value = state.currentUser.display_name || '';
        els.profileBioInput.value = state.currentUser.bio || '';
        els.profileInterestsInput.value = (state.currentUser.interests || []).join(', ');
        if (els.profileImageFileName) els.profileImageFileName.textContent = '선택된 파일 없음';
        els.profileEditAvatarPreview.outerHTML = avatarHtml(state.currentUser, 'profile-avatar', true).replace('class="profile-avatar', `id="profile-edit-avatar-preview" class="profile-avatar`);
        els.profileEditAvatarPreview = document.getElementById('profile-edit-avatar-preview');
        els.profileImageInput.value = '';
        els.profileEditOverlay.classList.remove('hidden');
    }

    function closeProfileEdit() {
        els.profileEditOverlay.classList.add('hidden');
    }

    async function openSettings(section = '') {
        await reloadCurrentSettings();
        setSettingsView(section === 'privacy' ? 'privacy' : section === 'content' ? 'content' : 'home');
        closeSettingsManager();
        els.settingsOverlay.classList.remove('hidden');
    }

    function closeSettings() {
        closeSettingsManager();
        setSettingsView('home');
        els.settingsOverlay.classList.add('hidden');
    }

    function updateSubmitBtnState() {
        const hasText = els.postInput.value.trim().length > 0;
        const hasImg = state.selectedImages.filter(Boolean).length > 0;
        els.postSubmitBtn.classList.toggle('active', hasText || hasImg);
    }

    function addImagesToPreview(files) {
        const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        if (state.selectedImages.filter(Boolean).length + validFiles.length > 2) {
            alert('이미지는 최대 2장까지만 첨부할 수 있습니다.');
            return;
        }
        validFiles.forEach(file => {
            state.selectedImages.push(file);
            const idx = state.selectedImages.length - 1;
            const reader = new FileReader();
            reader.onload = event => {
                const thumb = document.createElement('div');
                thumb.className = 'preview-thumb';
                thumb.innerHTML = `<img src="${event.target.result}" alt="Preview"><button class="remove-thumb">✕</button>`;
                thumb.querySelector('.remove-thumb').addEventListener('click', () => {
                    state.selectedImages[idx] = null;
                    thumb.remove();
                    if (!state.selectedImages.filter(Boolean).length) els.imagePreviewBar.classList.add('hidden');
                    updateSubmitBtnState();
                });
                els.imagePreviewBar.appendChild(thumb);
                els.imagePreviewBar.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        });
        updateSubmitBtnState();
    }

    async function submitPost() {
        const content = els.postInput.value.trim();
        const validImages = state.selectedImages.filter(Boolean);
        if (!content && !validImages.length) return;
        const formData = new FormData();
        formData.append('author_id', state.currentUserId);
        formData.append('content', content);
        validImages.forEach(file => formData.append('images', file));
        const res = await fetch('/api/posts', { method: 'POST', body: formData });
        const data = await res.json();
        if (!res.ok) {
            alert(data.detail || '게시물 등록에 실패했습니다.');
            return;
        }
        els.postInput.value = '';
        state.selectedImages = [];
        els.imagePreviewBar.innerHTML = '';
        els.imagePreviewBar.classList.add('hidden');
        updateSubmitBtnState();
        await Promise.all([loadFeed(true), loadNotifications(), openProfileIfCurrentUser()]);
    }

    async function openProfileIfCurrentUser() {
        if (state.currentProfileData && state.currentProfileData.user_id === state.currentUserId) {
            await openProfile(state.currentUserId);
        }
    }

    let lastCommandSlashAt = 0;
    let lastCommandInputSlashAt = 0;

    function bindBaseEvents() {
        addClick('go-find-btn', () => navigateTo('find'));
        addClick('go-signup-btn', () => navigateTo('signup'));
        addClick('go-admin-login-btn', () => navigateTo('adminLogin'));
        addClick('back-login-from-find', () => navigateTo('login'));
        addClick('back-login-from-signup', () => navigateTo('login'));
        addClick('back-login-from-admin', () => navigateTo('login'));

        document.getElementById('login-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                await postData('/api/login', {
                    user_id: document.getElementById('user-id').value,
                    password: document.getElementById('user-pw').value
                });
                state.currentUserId = document.getElementById('user-id').value;
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('loggedInUser', state.currentUserId);
                navigateTo('home');
                await initializeLoggedInExperience();
            } catch (error) {
                alert(error.message);
            }
        });

        els.adminLoginForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const data = await postData('/api/admin/login', {
                    admin_id: document.getElementById('admin-id').value,
                    password: document.getElementById('admin-pw').value
                });
                state.adminToken = data.token;
                localStorage.setItem('adminToken', state.adminToken);
                await initializeAdminExperience();
            } catch (error) {
                alert(error.message);
            }
        });

        els.adminLogoutBtn?.addEventListener('click', () => {
            state.adminToken = '';
            localStorage.removeItem('adminToken');
            navigateTo('login');
        });

        els.adminTabs.forEach(tab => tab.addEventListener('click', async () => {
            setAdminView(tab.dataset.adminView);
            if (state.currentAdminView === 'posts') await loadAdminPosts();
            if (state.currentAdminView === 'orders') await loadAdminOrders();
            if (state.currentAdminView === 'reports') await loadAdminReports();
            if (state.currentAdminView === 'bugs') await loadAdminBugReports();
        }));

        els.adminPostSearchBtn?.addEventListener('click', loadAdminPosts);
        els.adminPostSearchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') loadAdminPosts();
        });
        els.adminOrderSearchBtn?.addEventListener('click', loadAdminOrders);
        els.adminOrderSearchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') loadAdminOrders();
        });
        els.adminDetailCloseBtn?.addEventListener('click', closeAdminPostDetail);
        els.adminPostDetailOverlay?.addEventListener('click', (e) => {
            if (e.target === els.adminPostDetailOverlay) closeAdminPostDetail();
        });
        els.feedContent?.addEventListener('scroll', handleFeedScroll, { passive: true });
        document.addEventListener('keydown', (e) => {
            const commandModeOpen = isCommandModeOpen();
            if (commandModeOpen && state.commandSelectionMode && handleCommandSelectionKeydown(e)) return;
            if (commandModeOpen) {
                if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey && !isEditableTarget(e.target)) {
                    const now = Date.now();
                    e.preventDefault();
                    if (now - lastCommandSlashAt <= 420) {
                        closeCommandMode();
                        return;
                    }
                    lastCommandSlashAt = now;
                }
                return;
            }
            if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
            if (isEditableTarget(e.target)) return;

            const now = Date.now();
            if (now - lastCommandSlashAt <= 420) {
                e.preventDefault();
                lastCommandSlashAt = 0;
                openCommandMode();
                return;
            }
            lastCommandSlashAt = now;
        });
        els.commandModeInput?.addEventListener('keydown', async (e) => {
            if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
                const now = Date.now();
                if (now - lastCommandInputSlashAt <= 420) {
                    e.preventDefault();
                    closeCommandMode();
                    return;
                }
                lastCommandInputSlashAt = now;
            } else if (e.key.length === 1) {
                lastCommandInputSlashAt = 0;
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                if (state.commandSelectionMode) {
                    disableCommandSelection(true);
                    return;
                }
                els.commandModeInput.blur();
                els.commandModeInput.focus();
                return;
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                await runCommandModeCommand(els.commandModeInput.value);
            }
        });
        els.commandModeCloseBtn?.addEventListener('click', closeCommandMode);
        els.commandModeOverlay?.addEventListener('click', (e) => {
            if (e.target === els.commandModeOverlay) els.commandModeInput?.focus();
        });

        document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                await postData('/api/signup', {
                    user_id: document.getElementById('new-id').value,
                    password: document.getElementById('new-pw').value,
                    email: document.getElementById('new-email').value
                });
                navigateTo('login');
            } catch (error) {
                alert(error.message);
            }
        });

        document.getElementById('find-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('find-email').value;
            const findPw = confirm("비밀번호를 찾으시겠습니까?\n(확인: 비밀번호 찾기, 취소: 아이디 찾기)");
            try {
                if (findPw) {
                    const userId = prompt("아이디를 입력해주세요:");
                    if (!userId) return;
                    const res = await postData('/api/find-pw', { user_id: userId, email });
                    alert(`임시 비밀번호가 발급되었습니다: ${res.temp_password}`);
                } else {
                    const res = await postData('/api/find-id', { email });
                    alert(`가입하신 아이디는 [ ${res.user_id} ] 입니다.`);
                }
            } catch (error) {
                alert(error.message);
            }
        });

        els.logoutBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('loggedInUser');
            window.location.reload();
        });

        els.moreBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            els.moreMenu?.classList.toggle('show');
        });
        document.addEventListener('click', (e) => {
            if (els.moreMenu && els.moreBtn && !els.moreMenu.contains(e.target) && !els.moreBtn.contains(e.target)) {
                els.moreMenu.classList.remove('show');
            }
        });

        els.themeToggleBtns.forEach(button => button.addEventListener('click', (e) => {
            e.preventDefault();
            const nextTheme = document.body.classList.contains('light-mode') ? 'dark' : 'light';
            applyTheme(nextTheme);
        }));

        els.navHomeBtn?.addEventListener('click', async (e) => {
            e.preventDefault();
            switchMainSection('home');
            await loadFeed(true);
        });
        els.brandLogo?.addEventListener('click', async () => {
            switchMainSection('home');
            await loadFeed(true);
        });
        els.navSearchBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            switchMainSection('search');
        });
        els.navHookBtn?.addEventListener('click', async (e) => {
            e.preventDefault();
            switchMainSection('hook');
            setHookView(state.currentHookView || 'books');
            await loadHookDashboard();
        });
        els.navNotifBtn?.addEventListener('click', async (e) => {
            e.preventDefault();
            switchMainSection('notifications');
            await loadNotifications();
        });
        els.sidebarActivityBtn?.addEventListener('click', async (e) => {
            e.preventDefault();
            els.moreMenu?.classList.remove('show');
            switchMainSection('activity');
            await loadActivity();
        });
        els.activityRefreshBtn?.addEventListener('click', loadActivity);
        els.activityPeriodTabs.forEach(tab => tab.addEventListener('click', async () => {
            state.activityPeriod = tab.dataset.activityPeriod;
            state.activityStart = '';
            state.activityTrail = [];
            saveViewState({
                activityPeriod: state.activityPeriod,
                activityStart: state.activityStart
            });
            await loadActivity();
        }));
        els.activityBackBtn?.addEventListener('click', async () => {
            const previous = state.activityTrail.pop();
            if (!previous) return;
            state.activityPeriod = previous.period;
            state.activityStart = previous.start || '';
            saveViewState({
                activityPeriod: state.activityPeriod,
                activityStart: state.activityStart
            });
            await loadActivity();
        });
        els.navProfileBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            openProfile(state.currentUserId);
        });

        els.feedTabs.forEach(tab => tab.addEventListener('click', async () => {
            state.currentFeedType = tab.dataset.type;
            syncFeedControls();
            saveViewState({ feedType: state.currentFeedType });
            await loadFeed(true);
        }));

        els.subTabs.forEach(tab => tab.addEventListener('click', async () => {
            state.currentPopularTime = tab.dataset.time;
            syncFeedControls();
            saveViewState({ popularTime: state.currentPopularTime });
            await loadFeed(true);
        }));

        els.searchSubmitBtn?.addEventListener('click', doSearch);
        els.searchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') doSearch();
        });

        els.hookRefreshBtn?.addEventListener('click', loadHookDashboard);
        els.hookViewTabs.forEach(tab => tab.addEventListener('click', () => setHookView(tab.dataset.hookView)));
        els.hookOpenBuilderBtn?.addEventListener('click', () => openHookBuilder());
        els.hookBuilderCloseBtn?.addEventListener('click', closeHookBuilder);
        els.hookBuilderOverlay?.addEventListener('click', (e) => {
            if (e.target === els.hookBuilderOverlay) closeHookBuilder();
        });
        els.hookSourceTabs.forEach(tab => tab.addEventListener('click', () => {
            state.currentHookSource = tab.dataset.hookSource;
            state.hookSourceQuery = '';
            state.hookGlobalResults = [];
            els.hookPostSearchInput.value = '';
            els.hookPostSearchResults.innerHTML = '';
            saveViewState({ hookSource: state.currentHookSource });
            renderHookSourceList();
        }));
        els.hookPostSearchBtn?.addEventListener('click', searchPostsForHook);
        els.hookPostSearchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchPostsForHook();
        });
        els.hookSaveBookBtn?.addEventListener('click', saveHookBook);

        els.notificationTabs.forEach(tab => tab.addEventListener('click', async () => {
            state.currentNotificationTab = tab.dataset.notificationType;
            saveViewState({ notificationTab: state.currentNotificationTab });
            await loadNotifications();
        }));
        els.notificationsReadAllBtn?.addEventListener('click', async () => {
            try {
                await markAllNotificationsRead();
            } catch (error) {
                alert(error.message);
            }
        });

        els.detailBackBtn?.addEventListener('click', closePostDetail);
        els.detailOverlay?.addEventListener('click', (e) => {
            if (e.target === els.detailOverlay) closePostDetail();
        });

        els.detailReplySubmit?.addEventListener('click', async () => {
            if (!state.currentDetailPost) return;
            try {
                const data = await postData('/api/replies', {
                    post_id: state.currentDetailPost.id,
                    author_id: state.currentUserId,
                    content: els.detailReplyInput.value.trim()
                });
                state.currentDetailPost.replies = [...(state.currentDetailPost.replies || []), data.reply];
                els.detailReplyInput.value = '';
                renderPostDetail(state.currentDetailPost);
                await Promise.all([loadFeed(), loadNotifications(), openProfileIfCurrentUser()]);
            } catch (error) {
                alert(error.message);
            }
        });
        els.detailReplyInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') els.detailReplySubmit.click();
        });

        els.profileTabs.forEach(tab => tab.addEventListener('click', () => renderProfileTab(tab.dataset.tab)));
        els.profileBackBtn?.addEventListener('click', closeProfile);
        els.profileOverlay?.addEventListener('click', (e) => {
            if (e.target === els.profileOverlay) closeProfile();
        });

        els.profileEditBackBtn?.addEventListener('click', closeProfileEdit);
        els.profileEditOverlay?.addEventListener('click', (e) => {
            if (e.target === els.profileEditOverlay) closeProfileEdit();
        });
        els.profileImageInput?.addEventListener('change', () => {
            const [file] = els.profileImageInput.files || [];
            if (els.profileImageFileName) {
                els.profileImageFileName.textContent = file ? file.name : '선택된 파일 없음';
            }
            if (!file) return;
            const reader = new FileReader();
            reader.onload = event => {
                els.profileEditAvatarPreview.outerHTML = `<img id="profile-edit-avatar-preview" class="profile-avatar-image large" src="${event.target.result}" alt="미리보기">`;
                els.profileEditAvatarPreview = document.getElementById('profile-edit-avatar-preview');
            };
            reader.readAsDataURL(file);
        });
        els.profileEditForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData();
            formData.append('user_id', state.currentUserId);
            formData.append('display_name', els.profileDisplayNameInput.value.trim());
            formData.append('bio', els.profileBioInput.value.trim());
            formData.append('interests', els.profileInterestsInput.value.trim());
            const [file] = els.profileImageInput.files || [];
            if (file) formData.append('profile_image', file);
            const res = await fetch('/api/profile/update', { method: 'POST', body: formData });
            const data = await res.json();
            if (!res.ok) {
                alert(data.detail || '프로필 저장에 실패했습니다.');
                return;
            }
            await loadCurrentUserData();
            closeProfileEdit();
            if (state.currentProfileData?.user_id === state.currentUserId) await openProfile(state.currentUserId);
            await Promise.all([loadFeed(), loadNotifications()]);
        });
        els.goPrivacySettingsBtn?.addEventListener('click', () => {
            closeProfileEdit();
            openSettings('privacy');
        });

        els.settingsBackBtn?.addEventListener('click', closeSettings);
        els.openPrivacySettingsBtn?.addEventListener('click', () => setSettingsView('privacy'));
        els.openContentSettingsBtn?.addEventListener('click', () => setSettingsView('content'));
        els.settingsDetailBackBtns.forEach(btn => btn.addEventListener('click', () => setSettingsView(btn.dataset.targetView || 'home')));
        els.settingsManageTriggers.forEach(btn => btn.addEventListener('click', () => openSettingsManager(btn.dataset.manageType)));
        els.settingsManagerBackBtn?.addEventListener('click', closeSettingsManager);
        els.settingsUserSearchBtn?.addEventListener('click', searchUsersForSettings);
        els.settingsUserSearchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchUsersForSettings();
            }
        });
        els.settingsOverlay?.addEventListener('click', (e) => {
            if (e.target === els.settingsOverlay) closeSettings();
        });
        els.sidebarSettingsBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            els.moreMenu?.classList.remove('show');
            openSettings();
        });
        els.sidebarSavedBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            els.moreMenu?.classList.remove('show');
            openProfile(state.currentUserId).then(() => renderProfileTab('saves'));
        });
        els.sidebarBugReportBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            els.moreMenu?.classList.remove('show');
            els.bugReportOverlay?.classList.remove('hidden');
        });
        els.bugReportBackBtn?.addEventListener('click', () => els.bugReportOverlay?.classList.add('hidden'));
        els.bugReportOverlay?.addEventListener('click', (e) => {
            if (e.target === els.bugReportOverlay) els.bugReportOverlay.classList.add('hidden');
        });
        els.bugReportImageInput?.addEventListener('change', () => {
            const files = Array.from(els.bugReportImageInput.files || []).slice(0, 3);
            if (!els.bugReportFileName) return;
            els.bugReportFileName.textContent = files.length
                ? files.map(file => file.name).join(', ')
                : '선택된 파일 없음';
        });
        els.bugReportForm?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData();
            formData.append('reporter_id', state.currentUserId);
            formData.append('title', els.bugReportTitleInput.value.trim());
            formData.append('content', els.bugReportContentInput.value.trim());
            Array.from(els.bugReportImageInput.files || []).slice(0, 3).forEach(file => formData.append('images', file));
            const res = await fetch('/api/bug-reports', { method: 'POST', body: formData });
            const data = await res.json();
            if (!res.ok) {
                alert(data.detail || '버그 신고에 실패했습니다.');
                return;
            }
            els.bugReportForm.reset();
            if (els.bugReportFileName) els.bugReportFileName.textContent = '선택된 파일 없음';
            els.bugReportOverlay.classList.add('hidden');
            alert('버그 신고가 접수되었습니다.');
        });

        els.saveSettingsBtn?.addEventListener('click', async () => {
            try {
                await saveSettings();
            } catch (error) {
                alert(error.message);
            }
        });
        els.saveContentSettingsBtn?.addEventListener('click', async () => {
            try {
                await saveSettings();
            } catch (error) {
                alert(error.message);
            }
        });
        els.addCustomFilterBtn?.addEventListener('click', async () => {
            const keyword = els.customFilterInput.value.trim();
            if (!keyword) return;
            try {
                const data = await postData('/api/settings/custom-filter', { user_id: state.currentUserId, keyword });
                state.currentSettings.custom_filters = data.custom_filters;
                els.customFilterInput.value = '';
                renderCustomFilters(data.custom_filters);
                await Promise.all([loadFeed(), loadNotifications()]);
            } catch (error) {
                alert(error.message);
            }
        });

        els.addPhotoBtn?.addEventListener('click', () => els.imageUploadInput.click());
        els.imageUploadInput?.addEventListener('change', (e) => {
            if (e.target.files.length) addImagesToPreview(e.target.files);
            els.imageUploadInput.value = '';
        });
        els.postInput?.addEventListener('input', updateSubmitBtnState);
        els.postInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (els.postSubmitBtn.classList.contains('active')) submitPost();
            }
        });
        els.postSubmitBtn?.addEventListener('click', submitPost);

        els.feedContent?.addEventListener('dragenter', (e) => {
            e.preventDefault();
            state.dragCounter += 1;
            els.dropZone.classList.remove('hidden');
        });
        els.feedContent?.addEventListener('dragleave', (e) => {
            e.preventDefault();
            state.dragCounter -= 1;
            if (state.dragCounter <= 0) {
                state.dragCounter = 0;
                els.dropZone.classList.add('hidden');
            }
        });
        els.feedContent?.addEventListener('dragover', (e) => e.preventDefault());
        els.feedContent?.addEventListener('drop', (e) => {
            e.preventDefault();
            state.dragCounter = 0;
            els.dropZone.classList.add('hidden');
            if (e.dataTransfer.files.length) addImagesToPreview(e.dataTransfer.files);
        });
    }

    async function initializeLoggedInExperience() {
        await loadCurrentUserData();
        restoreViewState();
        syncFeedControls();
        const savedView = getSavedViewState();
        const savedSection = savedView.mainSection || localStorage.getItem('mainSection') || 'home';
        const postPermalinkId = getPostPublicIdFromPath();
        const initialSection = postPermalinkId ? 'home' : savedSection;
        localStorage.setItem('mainSection', initialSection);
        navigateTo('home');
        switchMainSection(initialSection, false);
        if (postPermalinkId) {
            state.openingPermalink = true;
            document.body.classList.add('permalink-opening');
            const [, opened] = await Promise.all([loadNotifications(), openPostPermalinkFromCurrentUrl()]);
            state.openingPermalink = false;
            document.body.classList.remove('permalink-opening');
            if (!opened) {
                await loadFeed(false);
            }
            return;
        }
        await Promise.all([loadMainSectionData(initialSection), loadNotifications()]);
        await openPostPermalinkFromCurrentUrl();
    }

    applyTheme();
    bindBaseEvents();

    if (state.adminToken && localStorage.getItem('isLoggedIn') !== 'true') {
        initializeAdminExperience();
    } else if (localStorage.getItem('isLoggedIn') === 'true' && state.currentUserId) {
        initializeLoggedInExperience();
    } else {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loggedInUser');
        navigateTo('login');
    }
});
