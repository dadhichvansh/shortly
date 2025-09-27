import mjml2html from 'mjml';
import fs from 'fs/promises';
import path from 'path';
import ejs from 'ejs';

export const fetchHtmlFromMjmlTemplate = async (template, variables) => {
  // read the MJML template file
  const mjmlTemplate = await fs.readFile(
    path.join(import.meta.dirname, '..', 'emails', `${template}.mjml`),
    'utf-8'
  );

  // replace variables in the template using a simple templating approach
  const filledTemplate = ejs.render(mjmlTemplate, variables);

  // convert MJML to HTML and return the HTML output
  return mjml2html(filledTemplate).html;
};
