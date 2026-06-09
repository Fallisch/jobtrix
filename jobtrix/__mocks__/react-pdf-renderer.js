const React = require("react");

const Document = ({ children }) => React.createElement("div", { "data-testid": "pdf-document" }, children);
const Page = ({ children }) => React.createElement("div", { "data-testid": "pdf-page" }, children);
const Text = ({ children }) => React.createElement("span", null, children);
const View = ({ children }) => React.createElement("div", null, children);
const StyleSheet = { create: (styles) => styles };
const Font = { register: jest.fn() };
const Image = ({ src }) => React.createElement("img", { src });

const pdf = jest.fn(() => ({
  toBlob: jest.fn().mockResolvedValue(new Blob(["mock pdf"], { type: "application/pdf" })),
}));

module.exports = { Document, Page, Text, View, StyleSheet, Font, Image, pdf };
