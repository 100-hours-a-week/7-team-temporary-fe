module.exports = {
  forbidden: [
    {
      name: "no-shared-deps",
      from: { path: "^src/shared" },
      to: { path: "^src/(entities|features|widgets|pages)" },
    },
    {
      name: "no-entities-deps",
      from: { path: "^src/entities" },
      to: { path: "^src/(features|widgets|pages)" },
    },
    {
      name: "no-features-deps",
      from: { path: "^src/features" },
      to: { path: "^src/(widgets|pages)" },
    },
    {
      name: "no-widgets-deps",
      from: { path: "^src/widgets" },
      to: { path: "^src/pages" },
    },
  ],
  options: {
    doNotFollow: {
      path: "node_modules",
    },
    exclude: {
      path: "node_modules|\\.next|dist|.*\\.stories\\.tsx$",
    },
  },
};
