"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_hook_form_1 = require("react-hook-form");
const antd_1 = require("antd");
const MapCanvas_1 = __importDefault(require("../../components/map/MapCanvas"));
const api_1 = require("../../api");
const MissionModal = (options) => {
    const { campaignId, missionId, isOpen, onClose, notify } = options;
    const [players, setPlayers] = (0, react_1.useState)([]);
    const [draftMatches, setDraftMatches] = (0, react_1.useState)([]);
    // Match Builder State
    const [matchType, setMatchType] = (0, react_1.useState)(1);
    const [teamA, setTeamA] = (0, react_1.useState)([]);
    const [teamB, setTeamB] = (0, react_1.useState)([]);
    const [selectedMission, setSelectedMission] = (0, react_1.useState)(null);
    const [mapBuilderOpen, setMapBuilderOpen] = (0, react_1.useState)(false);
    const { register, reset, handleSubmit, setValue, getValues, watch } = (0, react_hook_form_1.useForm)({
        defaultValues: {
            title: '',
            missionDetails: '',
            map: '',
            config: '{}',
        }
    });
    const currentMap = watch('map');
    const loadData = async () => {
        if (!isOpen)
            return;
        try {
            const fetchedPlayers = await api_1.api.listPlayersByCampaign(campaignId);
            setPlayers(fetchedPlayers);
            if (missionId) {
                // Wait for both to load
                const [missionDataList, matchData] = await Promise.all([
                    api_1.api.listMissionsByCampaign(campaignId),
                    api_1.api.listMissionMatches(missionId)
                ]);
                const missionData = missionDataList.find(m => m.id === missionId);
                if (missionData) {
                    setSelectedMission(missionData);
                    reset({
                        title: missionData.title,
                        missionDetails: missionData.missionDetails,
                        map: missionData.map,
                        config: missionData.config || '{}',
                    });
                }
                if (matchData) {
                    // Normalize MatchType just in case
                    const normalizedMatches = matchData.map(m => ({
                        ...m,
                        matchType: Number(m.matchType)
                    }));
                    setDraftMatches(normalizedMatches);
                }
            }
            else {
                setSelectedMission(null);
                setDraftMatches([]);
                reset({
                    title: '',
                    missionDetails: '',
                    map: '',
                    config: '{}',
                });
            }
        }
        catch (error) {
            console.error('Error loading mission data:', error);
            if (notify)
                notify('error', 'Failed to load mission details', error.message);
        }
    };
    (0, react_1.useEffect)(() => {
        loadData();
    }, [isOpen, missionId, campaignId]);
    // Computed states for Match Builder
    const usedPlayerIds = (0, react_1.useMemo)(() => {
        const used = new Set();
        draftMatches.forEach(match => {
            match.teamAPlayerIds.forEach(id => used.add(id));
            match.teamBPlayerIds.forEach(id => used.add(id));
        });
        return used;
    }, [draftMatches]);
    const availablePlayers = (0, react_1.useMemo)(() => {
        return players.filter(player => !usedPlayerIds.has(player.id));
    }, [players, usedPlayerIds]);
    const playerOptions = (0, react_1.useMemo)(() => {
        return availablePlayers.map(p => ({ value: p.id, label: `${p.playerName} (${p.army})` }));
    }, [availablePlayers]);
    const generateMatches = (0, react_1.useCallback)(() => {
        const teamSize = matchType;
        const playersPerMatch = teamSize * 2;
        const matchCount = Math.floor(availablePlayers.length / playersPerMatch);
        if (matchCount === 0) {
            if (notify)
                notify('warning', 'Not enough unmatched players for this match type.');
            return;
        }
        const newMatches = [];
        for (let i = 0; i < matchCount; i++) {
            const baseIndex = i * playersPerMatch;
            const teamAPlayerIds = availablePlayers.slice(baseIndex, baseIndex + teamSize).map(p => p.id);
            const teamBPlayerIds = availablePlayers.slice(baseIndex + teamSize, baseIndex + playersPerMatch).map(p => p.id);
            newMatches.push({ matchType, teamAPlayerIds, teamBPlayerIds });
        }
        setDraftMatches(prev => [...prev, ...newMatches]);
        if (notify)
            notify('success', `Generated ${matchCount} matches.`);
    }, [matchType, availablePlayers, notify]);
    const addManualMatch = (0, react_1.useCallback)(() => {
        const teamSize = matchType;
        if (teamA.length !== teamSize || teamB.length !== teamSize) {
            if (notify)
                notify('warning', `Select exactly ${teamSize} players per team for ${matchType}v${matchType}.`);
            return;
        }
        const combined = [...teamA, ...teamB];
        if (new Set(combined).size !== combined.length) {
            if (notify)
                notify('warning', 'A player cannot be selected more than once in a match.');
            return;
        }
        const duplicate = combined.find(id => usedPlayerIds.has(id));
        if (duplicate) {
            if (notify)
                notify('warning', 'A player cannot be selected more than once in this mission.');
            return;
        }
        setDraftMatches(prev => [...prev, { matchType, teamAPlayerIds: teamA, teamBPlayerIds: teamB }]);
        setTeamA([]);
        setTeamB([]);
        if (notify)
            notify('success', 'Match added manually.');
    }, [matchType, teamA, teamB, usedPlayerIds, notify]);
    const removeMatch = (0, react_1.useCallback)((indexToRemove) => {
        setDraftMatches(prev => prev.filter((_, idx) => idx !== indexToRemove));
    }, []);
    const onFormClose = (0, react_1.useCallback)(() => {
        onClose();
        setTeamA([]);
        setTeamB([]);
    }, [onClose]);
    const onSubmit = (0, react_1.useCallback)(async (data) => {
        try {
            let currentMissionId = missionId;
            if (!currentMissionId) {
                const created = await api_1.api.createMission(campaignId, data);
                currentMissionId = created.id;
                if (notify)
                    notify('success', 'Mission created successfully');
            }
            else {
                await api_1.api.updateMission(currentMissionId, data);
                if (notify)
                    notify('success', 'Mission updated successfully');
            }
            // Save matches
            if (currentMissionId) {
                await api_1.api.replaceMissionMatches(currentMissionId, draftMatches);
            }
            onFormClose();
        }
        catch (error) {
            console.error('Error saving mission:', error);
            if (notify)
                notify('error', 'Error saving mission', error.message);
        }
    }, [missionId, campaignId, draftMatches, notify, onFormClose]);
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(antd_1.Modal, { title: selectedMission ? 'Edit mission' : 'Create mission', closable: false, onCancel: onFormClose, open: isOpen, width: 720, footer: null, children: (0, jsx_runtime_1.jsxs)("form", { id: 'missionForm', className: 'detailsForm', onSubmit: handleSubmit(onSubmit), style: { display: 'flex', flexDirection: 'column', gap: 16 }, children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "mission-title", children: "Title" }, void 0), (0, jsx_runtime_1.jsx)("input", { id: "mission-title", type: "text", required: true, ...register('title') }, void 0), (0, jsx_runtime_1.jsxs)(antd_1.Row, { gutter: 24, children: [(0, jsx_runtime_1.jsx)(antd_1.Col, { span: 12, children: (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', flexDirection: 'column' }, children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "mission-details", children: "Mission details" }, void 0), (0, jsx_runtime_1.jsx)("textarea", { id: "mission-details", rows: 4, ...register('missionDetails') }, void 0), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 8 }, children: [(0, jsx_runtime_1.jsx)("label", { children: "Map Preview" }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Button, { type: "primary", size: "small", onClick: () => setMapBuilderOpen(true), children: "Open Map Builder" }, void 0)] }, void 0), (0, jsx_runtime_1.jsx)("div", { style: { height: 200, width: '100%', border: '1px solid #d9d9d9', borderRadius: 6, overflow: 'hidden', position: 'relative' }, children: (0, jsx_runtime_1.jsx)(MapCanvas_1.default, { readonly: true, initialMapJson: currentMap || '' }, currentMap?.length || 0) }, void 0), (0, jsx_runtime_1.jsx)("input", { type: "hidden", id: "mission-map", ...register('map') }, void 0), (0, jsx_runtime_1.jsx)("label", { htmlFor: "mission-config", style: { marginTop: 12 }, children: "Config (JSON object)" }, void 0), (0, jsx_runtime_1.jsx)("textarea", { id: "mission-config", rows: 4, ...register('config') }, void 0)] }, void 0) }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Col, { span: 12, children: (0, jsx_runtime_1.jsxs)("div", { style: { background: '#f5f5f5', padding: 16, borderRadius: 8 }, children: [(0, jsx_runtime_1.jsx)(antd_1.Typography.Title, { level: 4, style: { marginTop: 0 }, children: "Match builder" }, void 0), (0, jsx_runtime_1.jsxs)("div", { id: "mission-match-builder-controls", style: { display: availablePlayers.length > 0 ? 'flex' : 'none', flexDirection: 'column', gap: 8 }, children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "mission-match-type", children: "Match type" }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Select, { id: "mission-match-type", value: matchType, onChange: (v) => setMatchType(v), options: [
                                                            { value: 1, label: '1 vs 1' },
                                                            { value: 2, label: '2 vs 2' },
                                                            { value: 4, label: '4 vs 4' }
                                                        ] }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Button, { type: "primary", ghost: true, onClick: generateMatches, children: "Generate Matches" }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Divider, { style: { margin: '12px 0' } }, void 0), (0, jsx_runtime_1.jsx)("label", { htmlFor: "mission-match-team-a", children: "Team A players" }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Select, { mode: "multiple", options: playerOptions, value: teamA, onChange: setTeamA }, void 0), (0, jsx_runtime_1.jsx)("label", { htmlFor: "mission-match-team-b", children: "Team B players" }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Select, { mode: "multiple", options: playerOptions, value: teamB, onChange: setTeamB }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Button, { onClick: addManualMatch, children: "Add match" }, void 0)] }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Divider, { style: { margin: '16px 0', display: availablePlayers.length > 0 ? 'block' : 'none' } }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Typography.Text, { strong: true, children: "Current Matches" }, void 0), (0, jsx_runtime_1.jsx)("ul", { className: "campaign-list", style: { marginBottom: 16, padding: 0, listStyle: 'none' }, children: draftMatches.length === 0 ? ((0, jsx_runtime_1.jsx)("li", { style: { padding: '8px 0', color: 'rgba(0,0,0,0.45)' }, children: "No matches defined" }, void 0)) : (draftMatches.map((match, index) => {
                                                    const toName = (id) => players.find(p => p.id === id)?.playerName || `#${id}`;
                                                    const teamANames = match.teamAPlayerIds.map(toName).join(', ');
                                                    const teamBNames = match.teamBPlayerIds.map(toName).join(', ');
                                                    return ((0, jsx_runtime_1.jsxs)("li", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)(antd_1.Typography.Text, { type: "secondary", children: [match.matchType, "v", match.matchType, ": "] }, void 0), teamANames, " ", (0, jsx_runtime_1.jsx)(antd_1.Typography.Text, { strong: true, children: "vs" }, void 0), " ", teamBNames] }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Button, { type: "text", danger: true, size: "small", onClick: () => removeMatch(index), children: "Remove" }, void 0)] }, index));
                                                })) }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Typography.Text, { strong: true, children: "Unmatched players" }, void 0), (0, jsx_runtime_1.jsx)("ul", { className: "campaign-list", style: { padding: 0, listStyle: 'none' }, children: availablePlayers.length === 0 ? ((0, jsx_runtime_1.jsx)("li", { style: { padding: '8px 0', color: 'rgba(0,0,0,0.45)' }, children: "All players assigned" }, void 0)) : (availablePlayers.map((player) => ((0, jsx_runtime_1.jsxs)("li", { style: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }, children: [(0, jsx_runtime_1.jsx)(antd_1.Typography.Text, { children: player.playerName }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Typography.Text, { type: "secondary", children: player.army }, void 0)] }, player.id)))) }, void 0)] }, void 0) }, void 0)] }, void 0), (0, jsx_runtime_1.jsxs)(antd_1.Space, { style: { padding: '10px 0 0 0', justifyContent: 'flex-start', width: '100%' }, children: [(0, jsx_runtime_1.jsx)(antd_1.Button, { type: "primary", htmlType: "submit", children: selectedMission ? 'Save mission' : 'Create mission' }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Button, { type: "default", onClick: onFormClose, children: "Cancel" }, void 0)] }, void 0)] }, void 0) }, void 0), (0, jsx_runtime_1.jsx)(antd_1.Modal, { title: "Map Builder", open: mapBuilderOpen, onCancel: () => setMapBuilderOpen(false), footer: null, width: "90vw", style: { top: 20 }, styles: { body: { height: '80vh', padding: 0 } }, destroyOnClose: true, children: (0, jsx_runtime_1.jsx)(MapCanvas_1.default, { initialMapJson: getValues('map') || '', onSave: (json) => {
                        setValue('map', json, { shouldDirty: true });
                        setMapBuilderOpen(false);
                    } }, void 0) }, void 0)] }, void 0));
};
exports.default = MissionModal;
//# sourceMappingURL=missionModal.js.map