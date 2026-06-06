export default function PageHeader({ eyebrow, title, description, action }) {
  return (
    <section className="page-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action}
    </section>
  );
}
