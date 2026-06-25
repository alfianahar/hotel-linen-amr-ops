import Navbar from '../components/navbar'
import { useStorage, AutomationRule } from '../contexts/StorageContext'

export default function AutomationPage() {
  const { automationRules, addAutomationExecution } = useStorage()

  const handleTrigger = (rule: AutomationRule) => {
    addAutomationExecution(rule.id, 'completed')
  }

  return (
    <div className="h-screen flex flex-col bg-[#f5f5f5]">
      <Navbar />
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold mb-4">Automation Rules</h1>
          <div className="space-y-3">
            {automationRules.length === 0 && (
              <div className="bg-white rounded-lg border p-8 text-center text-muted-foreground">No automation rules configured</div>
            )}
            {automationRules.map(rule => (
              <div key={rule.id} className="bg-white rounded-lg border p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${rule.enabled ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className="font-semibold text-sm">{rule.name}</span>
                  </div>
                  <button className="text-xs bg-primary text-white rounded px-3 py-1.5 font-medium" onClick={() => handleTrigger(rule)}>
                    Trigger
                  </button>
                </div>
                {rule.description && <p className="text-xs text-muted-foreground mb-2">{rule.description}</p>}
                <div className="flex gap-2 text-[10px]">
                  <span className="bg-muted px-2 py-0.5 rounded">{rule.trigger_type}</span>
                  <span className="bg-muted px-2 py-0.5 rounded">{rule.action_type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
