import { unified } from "unified";
import { readFile, writeFile } from "fs/promises";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

const inputPath =  './core/content-file.md'
const outputPath = './theme/dist/html-output.html'


async function compileMarkdownToHtml() {
    const markdown = await readFile(inputPath, 'utf-8');

    const files = await unified()
        .use(remarkParse, { fragment: true })
        .use(remarkRehype)
        .use(rehypeStringify)
        .process(markdown);

    const html = String(files);
    
    await writeFile(outputPath, html);
    console.log('Successfully converted HTML to Markdown format at:', outputPath);
    console.log(html);
}

compileMarkdownToHtml().catch(console.error);