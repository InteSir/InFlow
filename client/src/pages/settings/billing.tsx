import { Separator } from "@/components/ui/separator"
import PricingPage from "./_components/subscriptionPage"

const Billing = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Billing</h3>
        <p className="text-sm text-muted-foreground">
          Manage your subscription and billing information
        </p>
      </div>
      <Separator />


      <PricingPage />
      

    </div>
  )
}

export default Billing
