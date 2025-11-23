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

    return {
        title,
        text: text.trim(),
        answers: rawAnswerBlocks,
        correctAnswers,
        type,
        raw
    };
}

const rawBlocks = readGiftFile("SujetB_data/EM-U4-p32_33-Review.gift");

const questions = rawBlocks.map(parseGiftQuestion);

console.log(questions[0]);