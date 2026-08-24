package com.media.otgvlc.otg

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import android.widget.Toast

/**
 * Helper for Realme UI, ColorOS (OPPO), OxygenOS (OnePlus) OTG 10-minute auto-cutoff
 */
object RealmeOtgHelper {

    fun isColorOsOrRealmeUi(): Boolean {
        val manufacturer = Build.MANUFACTURER.lowercase()
        val brand = Build.BRAND.lowercase()
        return manufacturer.contains("realme") ||
                manufacturer.contains("oppo") ||
                manufacturer.contains("oneplus") ||
                brand.contains("realme") ||
                brand.contains("oppo") ||
                brand.contains("oneplus")
    }

    fun openOtgSettings(context: Context) {
        val intents = listOf(
            // Realme / OPPO ColorOS OTG Connection Settings Activity
            Intent().setComponent(ComponentName("com.coloros.oppoguardelf", "com.coloros.powermanager.fuelgaue.PowerUsageModelActivity")),
            Intent().setComponent(ComponentName("com.android.settings", "com.android.settings.Settings\$OtgSettingsActivity")),
            Intent().setComponent(ComponentName("com.oplus.wirelesssettings", "com.oplus.wirelesssettings.OtgSettingsActivity")),
            Intent(Settings.ACTION_SETTINGS)
        )

        for (intent in intents) {
            try {
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                context.startActivity(intent)
                return
            } catch (_: Exception) {
                // Try next candidate intent
            }
        }

        Toast.makeText(context, "Please navigate to Settings -> Additional Settings -> OTG Connection", Toast.LENGTH_LONG).show()
    }
}
