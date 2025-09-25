


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
