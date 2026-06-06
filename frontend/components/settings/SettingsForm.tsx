interface SettingsFormProps {
  settings: any;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">General Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
            <input
              type="text"
              defaultValue={settings.general.organizationName}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
              <select
                defaultValue={settings.general.timezone}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              >
                <option>Africa/Lagos</option>
                <option>UTC</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select
                defaultValue={settings.general.currency}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              >
                <option>NGN</option>
                <option>USD</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Notifications</h3>
        <div className="space-y-4">
          {[
            { key: 'emailAlerts', label: 'Email Alerts' },
            { key: 'smsAlerts', label: 'SMS Alerts' },
            { key: 'pushNotifications', label: 'Push Notifications' },
            { key: 'maintenanceNotifications', label: 'Maintenance Notifications' },
          ].map((item) => (
            <label key={item.key} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                defaultChecked={settings.notifications[item.key as keyof typeof settings.notifications]}
                className="w-4 h-4 rounded text-purple-600"
              />
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Security</h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <span className="text-sm font-medium text-gray-700">Two-Factor Authentication</span>
            <input type="checkbox" defaultChecked={settings.security.twoFactorAuth} className="w-4 h-4 rounded text-purple-600" />
          </label>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
            <input
              type="number"
              defaultValue={settings.security.sessionTimeout}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
          Save Changes
        </button>
        <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
          Cancel
        </button>
      </div>
    </div>
  );
}
