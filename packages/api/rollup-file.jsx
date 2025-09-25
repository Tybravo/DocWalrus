


async function compileMdx() {
  const response = await fetch('/compile-mdx', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      path: './docs/intro.md', 
    }),
  });

  const data = await response.json();
  console.log(data.code); 
}

async function sendMdxToCompile(mdxSource) {
  const response = await fetch('http://localhost:3001/api/compile-mdx', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mdx: mdxSource }),
  });

  const data = await response.json();

  if (response.ok) {
    console.log('Compiled Code:', data.code);
    console.log('Frontmatter:', data.frontmatter);
  } else {
    console.error('Error:', data.error);
  }
}


async function sendMarkdownToCompile(markdownText) {
  const response = await fetch('http://localhost:3001/api/compile-markdown', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ markdown: markdownText }),
  });

  const data = await response.json();

  if (response.ok) {
    console.log('Compiled HTML:', data.html);
    
    document.getElementById('output').innerHTML = data.html;
  } else {
    console.error('Error:', data.error);
  }
}


