import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './TeamEditor.css';

const PRESET_COLORS = [
    '#3FD4A8', // Niama Teal (Default Accent)
    '#55E0B4', // Bright Teal
    '#3FD4A8', // Niama Teal
    '#FF9F55', // Bright Orange
    '#FF5C5C', // Red
    '#FFB020', // Yellow
    '#3E8ED0', // Blue
    '#9D4EDD', // Purple
];

interface TeamEditorProps {
    initialName: string;
    initialColor?: string;
    onSave: (name: string, color: string) => void;
    align?: 'left' | 'right';
}

export function TeamEditor({ initialName, initialColor = '#3FD4A8', onSave, align = 'left' }: TeamEditorProps) {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(initialName);
    const [color, setColor] = useState(initialColor);
    const [showPicker, setShowPicker] = useState(false);

    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Sync external changes
    useEffect(() => {
        setName(initialName);
        setColor(initialColor);
    }, [initialName, initialColor]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                if (isEditing) handleSave();
                setShowPicker(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isEditing, name, color]);

    const handleSave = () => {
        const finalName = name.trim() || initialName;
        setName(finalName);
        setIsEditing(false);
        onSave(finalName, color);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setName(initialName);
            setIsEditing(false);
            setShowPicker(false);
        }
    };

    const selectColor = (c: string) => {
        setColor(c);
        setShowPicker(false);
        onSave(name.trim() || initialName, c);
    };

    return (
        <div className={`team-editor ${align}`} ref={containerRef}>
            {/* Color Swatch */}
            <div className="team-color-wrapper">
                <button
                    className="team-color-swatch"
                    style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}66` }}
                    onClick={() => setShowPicker(!showPicker)}
                    aria-label="Pick color"
                />

                {/* Color Picker Popover */}
                {showPicker && (
                    <div className="color-picker-popover card">
                        <div className="color-grid">
                            {PRESET_COLORS.map(c => (
                                <button
                                    key={c}
                                    className={`color-option ${c === color ? 'selected' : ''}`}
                                    style={{ backgroundColor: c }}
                                    onClick={() => selectColor(c)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Name Editor */}
            {isEditing ? (
                <div className="team-name-input-wrapper">
                    <input
                        ref={inputRef}
                        type="text"
                        className="team-name-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        maxLength={20}
                        placeholder={t('setup.playerName')}
                    />
                    <button className="team-name-clear" onClick={() => setName('')}>×</button>
                </div>
            ) : (
                <span
                    className="team-name-display"
                    onClick={() => setIsEditing(true)}
                    title="Click to edit"
                >
                    {name}
                </span>
            )}
        </div>
    );
}
