import { compile } from '@mdx-js/mdx'
import { readFile } from 'fs/promises'
import esbuild from 'esbuild'

const filepath = './docs/intro.md'
const mdFormat = await readFile(filepath, 'utf-8')

const compiled = await compile(mdFormat, {
  jsx: true, 
  outputFormat: 'program', 
  providerImportSource: '@mdx-js/react'
})

const renderedFile = await esbuild.transform(String(compiled), {
  loader: 'jsx',
  format: 'esm', 
  sourcemap: false,
})

console.log(renderedFile.code)