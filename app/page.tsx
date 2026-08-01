import { UserButton, OrganizationSwitcher } from "@clerk/nextjs"

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col items-start justify-start p-6 gap-4">
      <UserButton />
      <OrganizationSwitcher
        afterCreateOrganizationUrl="/"
        afterSelectOrganizationUrl="/"
        afterLeaveOrganizationUrl="/"
        afterSelectPersonalUrl="/"
      />
    </div>
  )
}
