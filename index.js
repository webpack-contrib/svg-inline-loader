function getExtractedSVG (svgStr) {
    return svgStr.replace(/<\?xml[\s\S]*?>/gi, "")
                 .replace(/<!doctype[\s\S]*?>/gi, "")
                 .replace(/<!--[\s\S]*?-->/g, "")
                 .replace(/width="\d+(\.\d+)?(px)?"/gi, "")
                 .replace(/height="\d+(\.\d+)?(px)?"/gi, "")
                 .trim();
}

module.exports = function(content) {
    this.cacheable && this.cacheable();
    this.value = content;

    return "module.exports = " + JSON.stringify(getExtractedSVG(content));
};
