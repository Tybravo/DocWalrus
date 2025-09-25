import { Fragment, jsx, jsxs } from "react/jsx-runtime";

function _missingMdxReference(id, component) {
  throw new Error(
    "Expected " +
      (component ? "component" : "object") +
      " `" +
      id +
      "` to be defined: you likely forgot to import, pass, or provide it."
  );
}

function _createMdxContent(props) {
  const _components = {
    code: "code",
    h1: "h1",
    h2: "h2",
    hr: "hr",
    p: "p",
    pre: "pre",
    ...props.components,
  };

  const { Renders } = _components;
  if (!Renders) _missingMdxReference("Renders", true);

  return jsxs(Fragment, {
    children: [
      jsx(_components.hr, {}),
      "\n",
      jsx(_components.h2, {
        children:
          'title: "DocWalrus documentation guide"\r\ndescription: "This is an example of DocWalrus documentation step by step guide"',
      }),
      "\n",
      jsx(_components.h1, { children: "Hello MDX" }),
      "\n",
      jsxs(_components.p, {
        children: [
          "Welcome to the Quickstart guide for DocWalrus documentation: ",
          jsx(Renders, {}),
        ],
      }),
      "\n",
      jsx(_components.p, { children: "And below is a quick headstart:" }),
      "\n",
      jsx(_components.pre, {
        children: jsx(_components.code, {
          className: "language-js",
          children: '\r\nconsole.log("Official link to documentation for DocWalrus");\n',
        }),
      }),
    ],
  });
}

export default function MDXContent(props = {}) {
  const { wrapper: MDXLayout } = props.components || {};
  return MDXLayout
    ? jsx(MDXLayout, { ...props, children: jsx(_createMdxContent, { ...props }) })
    : _createMdxContent(props);
}
