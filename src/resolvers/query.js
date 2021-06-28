module.exports = {
  notes: async (parent, args, { models }) => {
    return await models.Note.find();
  },
  singleNote: async (parent, args, { models }) => {
    return await models.Note.findById(args.id);
  },
};
