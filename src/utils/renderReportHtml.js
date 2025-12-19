import ReactDOMServer from 'react-dom/server';
import ReportTemplate from '../components/ReportTemplate';

export const renderReportToHtml = (data) => {
  const html = ReactDOMServer.renderToStaticMarkup(
    <ReportTemplate {...data} />
  );
  return `<!DOCTYPE html><html><head><meta charset="utf-8" /></head><body>${html}</body></html>`;
};
