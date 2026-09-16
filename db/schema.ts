import {
  sqliteTable,
  text,
  integer,
  index,
  primaryKey,
  unique,
} from 'drizzle-orm/sqlite-core';
export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  sortOrder: integer('sort_order').notNull(),
  icon: text('icon').notNull(),
});
export const sources = sqliteTable('sources', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  url: text('url'),
  license: text('license').notNull(),
  revision: text('revision'),
});
export const templates = sqliteTable(
  'templates',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    categoryId: text('category_id')
      .notNull()
      .references(() => categories.id),
    description: text('description').notNull(),
    content: text('content').notNull(),
    translation: text('translation').notNull().default(''),
    kind: text('kind').notNull(),
    sourceId: text('source_id')
      .notNull()
      .references(() => sources.id),
    sourceRecordId: text('source_record_id'),
    sourceUrl: text('source_url'),
    status: text('status').notNull().default('published'),
    version: integer('version').notNull().default(1),
  },
  (t) => [
    index('idx_templates_category_status').on(t.categoryId, t.status),
    index('idx_templates_kind_status').on(t.kind, t.status),
  ],
);
export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  label: text('label').notNull().unique(),
});
export const templateTags = sqliteTable(
  'template_tags',
  {
    templateId: text('template_id')
      .notNull()
      .references(() => templates.id, { onDelete: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tags.id),
  },
  (t) => [
    primaryKey({ columns: [t.templateId, t.tagId] }),
    index('idx_template_tags_tag').on(t.tagId),
  ],
);
export const fields = sqliteTable(
  'template_fields',
  {
    id: text('id').primaryKey(),
    templateId: text('template_id')
      .notNull()
      .references(() => templates.id, { onDelete: 'cascade' }),
    key: text('key').notNull(),
    label: text('label').notNull(),
    type: text('type').notNull(),
    required: integer('required').notNull().default(0),
    defaultJson: text('default_json').notNull(),
    maxSelections: integer('max_selections').notNull().default(1),
    sortOrder: integer('sort_order').notNull(),
  },
  (t) => [index('idx_fields_template').on(t.templateId)],
);
export const suggestions = sqliteTable(
  'field_suggestions',
  {
    id: text('id').primaryKey(),
    fieldId: text('field_id')
      .notNull()
      .references(() => fields.id, { onDelete: 'cascade' }),
    label: text('label').notNull(),
    conditionKey: text('condition_key'),
    conditionValue: text('condition_value'),
    sortOrder: integer('sort_order').notNull(),
  },
  (t) => [index('idx_suggestions_field').on(t.fieldId)],
);
export const favorites = sqliteTable(
  'favorites',
  {
    visitorId: text('visitor_id').notNull(),
    templateId: text('template_id')
      .notNull()
      .references(() => templates.id, { onDelete: 'cascade' }),
    createdAt: text('created_at').notNull(),
  },
  (t) => [primaryKey({ columns: [t.visitorId, t.templateId] })],
);
export const plans = sqliteTable(
  'plans',
  {
    id: text('id').primaryKey(),
    visitorId: text('visitor_id').notNull(),
    templateId: text('template_id')
      .notNull()
      .references(() => templates.id),
    title: text('title').notNull(),
    valuesJson: text('values_json').notNull(),
    locksJson: text('locks_json').notNull(),
    output: text('output').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (t) => [index('idx_plans_visitor_updated').on(t.visitorId, t.updatedAt)],
);
export const contentVersions = sqliteTable('content_versions', {
  id: text('id').primaryKey(),
  appliedAt: text('applied_at').notNull(),
});
export const skillResources = sqliteTable('skill_resources', {
  id: text('id').primaryKey(), metadataJson: text('metadata_json').notNull(),
});
export const taskResources = sqliteTable('task_resources', {
  id: text('id').primaryKey(), status: text('status').notNull(), metadataJson: text('metadata_json').notNull(),
});
export const videoProjects = sqliteTable('video_projects', {
  id: text('id').primaryKey(), visitorId: text('visitor_id').notNull(),
  title: text('title').notNull(), payloadJson: text('payload_json').notNull(),
  revision: integer('revision').notNull().default(1), updatedAt: text('updated_at').notNull(),
}, t=>[index('video_projects_owner').on(t.visitorId,t.updatedAt)]);
export const feedback = sqliteTable('feedback', {
  id:text('id').primaryKey(),visitorId:text('visitor_id').notNull(),summary:text('summary').notNull(),
  context:text('context').notNull(),kind:text('kind').notNull(),status:text('status').notNull(),
  digest:text('digest').notNull(),createdAt:text('created_at').notNull(),
}, t=>[unique().on(t.visitorId,t.digest),index('feedback_owner_date').on(t.visitorId,t.createdAt),index('feedback_review').on(t.status,t.createdAt)]);
