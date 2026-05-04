import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useProtectedRoute } from '../../hooks/useProtectedRoute';
import { showToast } from '../../lib/toast';
import { toUserMessage } from '../../lib/errors';
import '../../styles.css';

const Onboarding = () => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const [displayName, setDisplayName] = useState('');
    const [familyName, setFamilyName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        const checkUser = async () => {
            const user = await useProtectedRoute({ nextUrl: location.pathname + location.search });
            if (user) {
                setUser(user);
            }
            setIsLoading(false);
        };
        checkUser();
    }, [location]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const codeFromUrl = params.get('code') || '';
        if (codeFromUrl) {
            setInviteCode(codeFromUrl);
        }
    }, [location.search]);

    const upsertProfile = async () => {
        if (!user) return;
        const { error } = await supabase
            .from('profiles')
            .upsert({ id: user.id, display_name: displayName.trim() || null });
        if (error) throw error;
    };

    const goToApp = (familyId) => {
        const url = familyId ? `/app?family=${familyId}` : '/app';
        navigate(url);
    };

    const joinByCode = async (code) => {
        const { data, error } = await supabase.rpc('join_family_by_code', { code });
        if (error) throw error;
        const familyId = data?.family_id || data?.id || data;
        showToast('Joined family.', 'success');
        goToApp(familyId);
    };

    useEffect(() => {
        const handleAutoJoin = async () => {
            const params = new URLSearchParams(location.search);
            const codeFromUrl = params.get('code');
            if (codeFromUrl && user) {
                setStatus('Joining family...');
                try {
                    await upsertProfile();
                    await joinByCode(codeFromUrl);
                } catch (error) {
                    setStatus('');
                    showToast(toUserMessage(error), 'error');
                }
            }
        };
        handleAutoJoin();
    }, [user, location.search, displayName]);

    const handleCreateFamily = async () => {
        if (!familyName.trim()) {
            showToast('Family name is required.', 'error');
            return;
        }

        try {
            await upsertProfile();
            const { data, error } = await supabase
                .from('families')
                .insert({ name: familyName.trim(), created_by_user_id: user.id })
                .select()
                .single();

            if (error) throw error;
            showToast('Family created.', 'success');
            goToApp(data?.id);
        } catch (error) {
            showToast(toUserMessage(error), 'error');
        }
    };

    const handleJoinFamily = async () => {
        if (!inviteCode.trim()) {
            showToast('Invite code is required.', 'error');
            return;
        }

        try {
            await upsertProfile();
            await joinByCode(inviteCode.trim());
        } catch (error) {
            showToast(toUserMessage(error), 'error');
        }
    };

    if (isLoading || !user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="card">
            <h2>Welcome</h2>
            <p className="muted">Let’s set up your profile and family.</p>
            <div className="stack">
                <label className="field">
                    <span>Display name</span>
                    <input
                        id="display-name"
                        type="text"
                        placeholder="Sam"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                    />
                </label>
                <div className="card-sub">
                    <h3>Create a new family</h3>
                    <div className="row">
                        <input
                            id="family-name"
                            type="text"
                            placeholder="Family name"
                            value={familyName}
                            onChange={(e) => setFamilyName(e.target.value)}
                        />
                        <button id="create-family" onClick={handleCreateFamily}>
                            Create
                        </button>
                    </div>
                </div>
                <div className="card-sub">
                    <h3>Join with invite code</h3>
                    <div className="row">
                        <input
                            id="invite-code"
                            type="text"
                            placeholder="Invite code"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value)}
                        />
                        <button id="join-family" onClick={handleJoinFamily}>
                            Join
                        </button>
                    </div>
                </div>
            </div>
            <p id="status" className="muted">{status}</p>
        </div>
    );
};

export default Onboarding;
