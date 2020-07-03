import unified from 'unified';
import remark from 'remark-parse';
// @ts-ignore
import remarkRehype from 'remark-rehype';
// @ts-ignore
import rehypeRaw from 'rehype-raw';
// @ts-ignore
import rehypeSanitize from 'rehype-sanitize';
import stringify from 'rehype-stringify';
import merge from 'deepmerge';
// @ts-ignore
import ghSchema from 'hast-util-sanitize/lib/github.json';
import { ViewerProps } from '.';

export function processMarkdown({
  value,
  markdownOptions,
  plugins = [],
}: ViewerProps) {
  let parser = unified().use(remark, markdownOptions);

  plugins.forEach(({ remarkTransformer }) => {
    if (remarkTransformer) parser = remarkTransformer(parser);
  });

  parser = parser
    .use(remarkRehype, { allowDangerousHTML: true })
    .use(rehypeRaw);

  let schema = ghSchema;
  plugins.forEach(({ markdownSanitizeSchema }) => {
    if (markdownSanitizeSchema) schema = merge(schema, markdownSanitizeSchema);
  });

  parser = parser.use(rehypeSanitize, schema);

  plugins.forEach(({ rehypeTransformer }) => {
    if (rehypeTransformer) parser = rehypeTransformer(parser);
  });

  parser = parser.use(stringify);

  // console.log(parser.parse(value));
  return parser.processSync(value).toString();
}
