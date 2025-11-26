import * as fs from "fs";

export function readGiftFile(file) {
    const content = fs.readFileSync(file, 'utf8');
    const rawBlocks = content.split(/\n::/);
    const questions = rawBlocks.map((block, index) => {

        if (index === 0 && !block.startsWith("::")) {
            return null;
        }

        const fullBlock = block.startsWith("::") ? block :"::" + block;

        return fullBlock.trim();
    }).filter(Boolean);

    return questions;
}

export function parseGiftQuestion(block) {
    const raw = block;

    const titleMatch = block.match(/^::([^:]+)::/);
    const title = titleMatch ? titleMatch[1].trim() : "Untitled";

    let rest = block.replace(/^::[^:]+::/, "").trim();

    const rawAnswerBlocks = [...rest.matchAll(/\{([^}]*)\}/g)].map(m => m[1].trim());

    let correctAnswers = [];

    rawAnswerBlocks.forEach(block => {
        const parts = block.split(/(?=[~=])/g);

        parts.forEach(p => {
            p = p.trim();

            if (p.startsWith("=")) {
                let answer = p.replace(/^=+/, "").trim();
                answer = answer.replace(/^%?\d*%?/, "").trim();
                correctAnswers.push(answer);
            }
        });
    });

    let text = rest.replace(/\{[^}]*\}/g, "(___)");

    text = text.replace(/\[(html|plain|markdown|moodle)\]/gi, "");

    let type = "unknown";

    if (rawAnswerBlocks.length === 0) {
        type = "text";
    } else if (rawAnswerBlocks.some(a => a.includes("->"))) {
        type = "matching";
    } else if (rawAnswerBlocks.some(a => a.startsWith("T") || a.startsWith("F"))) {
        type = "truefalse";
    } else if (rawAnswerBlocks.some(a => a.includes("SA:") || /^\d+:/.test(a))) {
        type = "cloze";
    } else if (rawAnswerBlocks.some(a => a.includes("=") || a.includes("~"))) {
        type = "multiplechoice";
    }

    function parseChoiceParts(b) {
        const out = [];
        if (!b) return out;
        let base = b.replace(/^\d+:[A-Za-z]+:/, '').trim();
        const parts = base.split(/(?=[~=])/g);
        for (let p of parts) {
            p = p.trim();
            if (!p) continue;
            const correct = p.startsWith('=');
            let txt = p.replace(/^=+/, '').replace(/^~+/, '').replace(/^%?\d+%?/, '').trim();
            if (txt) {
                out.push({ text: txt, correct });
            }
        }
        return out;
    }

    let choices = null;
    let matchingPairs = null;

    if (type === 'multiplechoice') {
        choices = [];
        rawAnswerBlocks.forEach(b => {
            const c = parseChoiceParts(b);
            choices.push(...c);
        });
    } else if (type === 'cloze') {
        choices = rawAnswerBlocks.map((b) => parseChoiceParts(b));
    } else if (type === 'truefalse') {
        choices = [];
        rawAnswerBlocks.forEach(b => {
            const opt = b.trim().toUpperCase();
            if (/^T|TRUE/.test(opt)) choices.push({ text: 'True', correct: true });
            else if (/^F|FALSE/.test(opt)) choices.push({ text: 'False', correct: false });
            else {
                if (opt.includes('T')) choices.push({ text: 'True', correct: true });
                if (opt.includes('F')) choices.push({ text: 'False', correct: true });
            }
        });
    } else if (type === 'matching') {
        matchingPairs = [];
        rawAnswerBlocks.forEach(b => {
            const pairs = b.split(/(?==)/g).map(s=>s.trim()).filter(Boolean);
            pairs.forEach(p => {
                const match = p.match(/^=([^->]+)->(.+)$/);
                if (match) matchingPairs.push({ left: match[1].trim(), right: match[2].trim() });
            });
        });
    }

    function buildDisplay() {
        let out = '';
        out += `${title} [${type}]\n`;
        out += `${text}\n`;

        if (type === 'multiplechoice' && Array.isArray(choices)) {
            const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            out += '\nOptions:\n';
            choices.forEach((c, i) => {
                const label = labels[i] || String(i+1);
                const mark = c.correct ? ' (✓)' : '';
                out += `${label}) ${c.text}${mark}\n`;
            });
        } else if (type === 'cloze' && Array.isArray(choices)) {
            const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            choices.forEach((blockChoices, bi) => {
                out += `\nBlank ${bi+1}:\n`;
                blockChoices.forEach((c, i) => {
                    const label = labels[i] || String(i+1);
                    const mark = c.correct ? ' (✓)' : '';
                    out += `${label}) ${c.text}${mark}\n`;
                });
            });
        } else if (type === 'truefalse' && Array.isArray(choices)) {
            out += '\nTrue/False:\n';
            choices.forEach((c) => {
                const mark = c.correct ? ' (✓)' : '';
                out += `${c.text}${mark}\n`;
            });
        } else if (type === 'matching' && Array.isArray(matchingPairs)) {
            out += '\nMatching pairs:\n';
            matchingPairs.forEach((p, i) => {
                out += `${i+1}) ${p.left} -> ${p.right}\n`;
            });
        }

        return out.trim();
    }

    const display = buildDisplay();

    return {
        title,
        text: text.trim(),
        answers: rawAnswerBlocks,
        correctAnswers,
        type,
        raw,
        choices,
        matchingPairs,
        display
    };
}
