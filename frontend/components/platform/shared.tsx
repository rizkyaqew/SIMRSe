/** Reuse existing project primitives without introducing a second design system. */
export {
  ActionLink,
  Confirm,
  DataTable,
  EmptyState,
  FormField,
  Notice,
  Panel,
  SelectControl,
  Status,
  useUnsavedChanges,
} from "../simrs/ui"
export function PageHeading({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  )
}
