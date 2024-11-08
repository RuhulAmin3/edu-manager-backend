export const queryOptions = [
  'searchTerm',
  'title',
  'class',
  'year',
  'month',
  'classId',
  'authorId',
];

export const examRelationalFields: string[] = ['classId', 'authorId'];
export const examRelationalFieldsMapper: { [key: string]: string } = {
  classId: 'class',
  authorId: 'author',
};
