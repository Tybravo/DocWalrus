import { readFile, writeFile } from "fs/promises";
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkStringify from "remark-stringify";
import { createWriteStream } from "fs";

const inputPath = './theme/dist/main.html'
const outputPath = './core/content-file.md'

async function compileHTMLToMarkdown() {
    const htmlFiles = await readFile(inputPath, 'utf-8');

    const content = await unified()
        .use(rehypeParse, { fragment: true })
        .use(rehypeRemark)
        .use(remarkStringify)
        .process(htmlFiles);

    const markdowns = String(content);
    
    await writeFile(outputPath, markdowns);
    console.log('Successfully converted HTML to Markdown format at:', outputPath);
    console.log(markdowns);
}

compileHTMLToMarkdown().catch(console.error);