import { h } from "../../render/escape.js";

export function collectionSidebar(node) {
  const links = node.children.map(
    (child) => h`<li><a href="/${child.path}/">${child.label}</a></li>`,
  );
  return h`<ul>$${links}</ul>`;
}

export function genCollection(node) {
  const main = node.children.map(
    (child) =>
      h`
      <li>
        <a href="/${child.path}/"><strong>${child.label}</strong></a>
        ${child.subtitle}
      </li>
    `,
  );

  return h`
    <hr />
    <ul class="page-links">$${main}</ul>
  `;
}
