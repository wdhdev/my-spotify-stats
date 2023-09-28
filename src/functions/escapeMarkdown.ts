export default function escapeMarkdown(text: string) {
    const unescaped = text.replace(/\\(\*|_|`|~|\\)/g, "$1"); // Unescape any "backslashed" character
    const escaped = unescaped.replace(/(\*|_|`|~|\\)/g, "\\$1"); // Escape *, _, `, ~, \

    return escaped;
}
