import React from 'react';
import {diffWords} from 'diff';

const DiffHighlight = ({oldText, newText, perspective}) => {
    if (!oldText && !newText) return null;

    const old = oldText || '';
    const cur = newText || '';
    const parts = diffWords(old, cur);

    return (
        <span>
            {parts.map((part, i) => {
                if (part.added) {
                    if (perspective === 'new') {
                        return (
                            <span key={i} style={{backgroundColor: '#acf2bd'}}>
                                {part.value}
                            </span>
                        );
                    }
                    return null;
                }
                if (part.removed) {
                    if (perspective === 'old') {
                        return (
                            <span
                                key={i}
                                style={{
                                    backgroundColor: '#fdb8c0'
                                }}
                            >
                                {part.value}
                            </span>
                        );
                    }
                    return null;
                }
                return <span key={i}>{part.value}</span>;
            })}
        </span>
    );
};

export default DiffHighlight;
