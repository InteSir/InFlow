import EnableMfa from "./EnableMFa";
import Sessions from "./Session";


export default function SecuritySetting(){
    return(
        <div>
            <div className=" mb-5 py-2 border-b"> 
                <h1 className="text-xl tracking-[-0.16px] text-slate-12 font-bold mb-4"> Security & Access</h1>
            </div>
    
            <EnableMfa/>
            <Sessions />
        </div>
    )
}