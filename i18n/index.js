function load(lang = "en") {
  try {
    return {
      WORDS: require(`./words-${lang}.json`),
      TEXTS: require(`./texts-${lang}.json`)
    }
  } catch(e) {
    return load("en");
  }
}

function stringTemplateParser(expression, valueObj) {
  const templateMatcher = /{{\s?([^{}\s]*)\s?}}/g;
  let text = expression.replace(templateMatcher, (substring, value, index) => {
    value = valueObj[value];
    return value;
  });
  return text
}

module.exports = {
  load,
  stringTemplateParser,
}