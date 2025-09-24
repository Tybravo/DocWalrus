import { writeFile } from "fs/promises";
import { readFile } from "fs/promises";
import * as esbuild from "esbuild";
import jsx from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import remarkFrontmatter from "remark-frontmatter";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import matter from "gray-matter";
import { compile } from '@mdx-js/mdx';

const inputPath = './core/content.mdx';

async function compileMDX() {
    const file = await readFile(inputPath, 'utf-8');

    const { content, data: frontmatter } = matter(file);

    const compiledFile = await compile(content, {
        jsx: true,
        outputFormat: 'function-body',
        remarkPlugins: [remarkGfm, remarkFrontmatter, remarkMath],
        rehypePlugins: [rehypeKatex],
        useDynamicImport: false,
        development: false,
    });

    const { code } = await esbuild.transform(String(compiledFile), {
        loader: 'jsx',
        format: 'esm',
    })

    //const { default: MDXContent } = await eval(compiledFile.value);
    //const htmlFormat = renderToString(React.createElement(compiledFile));
    //console.log('Successfully compiled and written to:', outputPath);

    const outputPath = './theme/dist/output.html'
    await writeFile(outputPath, code);

    console.log(code)
}

// function evalMdx(code) {
//     const scope = {React, ...runtime };
//     const resolver = new Function(...Object.keys(scope), `${code};
//     return { default: MDXContent }`);
//     return resolver(...Object.values(scope));
// }

compileMDX().catch(console.error)