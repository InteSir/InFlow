import { PROTECTED_ROUTES } from "@/routes/common/routePath"
import { TrendingUpIcon } from "lucide-react"

import { Link } from "react-router-dom"

const Logo = (props: { url?: string }) => {
  return (
    <Link to={props.url || PROTECTED_ROUTES.OVERVIEW} className="flex items-center gap-2">
    <div className="bg-blue-600 text-white h-6.5 w-6.5 rounded flex items-center justify-center dark:bg-[#C6FF34]/90 dark:text-black">
      <TrendingUpIcon />
    </div>
    <span style={{ fontSize: "18px", fontWeight: 800, color: "" }}>InFlow</span>
  </Link>
  )
}

export default Logo