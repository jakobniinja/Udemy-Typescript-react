import { useEffect, useRef } from "react";
import "./preview.css";

interface PreviewProps {
  code: string;
}

const html = `
<html>
<head></head>
<body>
<div id="root"></div>
<script>


window.addEventListener('message', (event) => {
  try{
    eval(event.data)
  } catch(err) {
    const root = document.querySelector("#root");
    root.innerHTML = '<div style="color: red;"><h4>Runtime Error</h4>' + err + "</div>";
    throw err;
  }
}, false);

</script>
</body>
</html>
    `;

export const Preview: React.FC<PreviewProps> = ({ code }) => {
  const iframe = useRef<any>();

  useEffect(() => {
    iframe.current.srcdoc = html;
    iframe.current.contentWindow.postMessage(code, "*");
  }, [code]);

  return (
    <div className="preview-wrapper">
      <iframe
        style={{ backgroundColor: "white" }}
        title="iframe"
        ref={iframe}
        sandbox="allow-scripts"
        srcDoc={html}
        frameBorder="1"
      />
    </div>
  );
};

export default Preview;
