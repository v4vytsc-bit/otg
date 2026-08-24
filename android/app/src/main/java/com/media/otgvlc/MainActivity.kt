package com.media.otgvlc

import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.hardware.usb.UsbDevice
import android.hardware.usb.UsbManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.documentfile.provider.DocumentFile
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.GridLayoutManager
import com.media.otgvlc.audio.AudioRoutingHelper
import com.media.otgvlc.data.AppDatabase
import com.media.otgvlc.data.WatchHistoryEntity
import com.media.otgvlc.databinding.ActivityMainBinding
import com.media.otgvlc.otg.OtgDeviceDetector
import com.media.otgvlc.otg.RealmeOtgHelper
import com.media.otgvlc.ui.VideoAdapter
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var database: AppDatabase
    private lateinit var audioRoutingHelper: AudioRoutingHelper
    private lateinit var videoAdapter: VideoAdapter

    private var currentDriveId: String = "primary_otg"
    private var currentDirectoryUri: Uri? = null

    // Storage Access Framework Tree Picker (API 24+)
    private val openDocumentTreeLauncher = registerForActivityResult(
        ActivityResultContracts.OpenDocumentTree()
    ) { uri: Uri? ->
        if (uri != null) {
            contentResolver.takePersistableUriPermission(
                uri,
                Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION
            )
            currentDirectoryUri = uri
            loadDirectoryVideos(uri)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        database = AppDatabase.getInstance(applicationContext)
        audioRoutingHelper = AudioRoutingHelper(this)

        setupRecyclerView()
        setupListeners()
        checkRealmeOtgTimeout()

        // Handle Intent launched from USB_DEVICE_ATTACHED
        handleIncomingIntent(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleIncomingIntent(intent)
    }

    private fun handleIncomingIntent(intent: Intent?) {
        if (intent?.action == UsbManager.ACTION_USB_DEVICE_ATTACHED) {
            val device: UsbDevice? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                intent.getParcelableExtra(UsbManager.EXTRA_DEVICE, UsbDevice::class.java)
            } else {
                @Suppress("DEPRECATION")
                intent.getParcelableExtra(UsbManager.EXTRA_DEVICE)
            }

            if (device != null) {
                currentDriveId = "USB_${device.vendorId}_${device.productId}"
                Toast.makeText(this, "OTG Drive Connected: ${device.productName ?: "USB Drive"}", Toast.LENGTH_SHORT).show()
                promptSelectOtgFolder()
            }
        }
    }

    private fun setupRecyclerView() {
        videoAdapter = VideoAdapter(
            onVideoClicked = { videoItem, startPositionMs ->
                launchPlayer(videoItem, startPositionMs)
            }
        )
        binding.recyclerViewVideos.layoutManager = GridLayoutManager(this, 2)
        binding.recyclerViewVideos.adapter = videoAdapter
    }

    private fun setupListeners() {
        binding.btnSelectFolder.setOnClickListener {
            promptSelectOtgFolder()
        }

        binding.btnRealmeFix.setOnClickListener {
            RealmeOtgHelper.openOtgSettings(this)
        }

        binding.btnAudioRouting.setOnClickListener {
            showAudioRoutingDialog()
        }
    }

    private fun promptSelectOtgFolder() {
        openDocumentTreeLauncher.launch(null)
    }

    private fun checkRealmeOtgTimeout() {
        if (RealmeOtgHelper.isColorOsOrRealmeUi()) {
            binding.bannerRealmeWarning.visibility = View.VISIBLE
        } else {
            binding.bannerRealmeWarning.visibility = View.GONE
        }
    }

    private fun loadDirectoryVideos(treeUri: Uri) {
        lifecycleScope.launch(Dispatchers.IO) {
            val rootDoc = DocumentFile.fromTreeUri(this@MainActivity, treeUri)
            val videoItems = mutableListOf<VideoAdapter.VideoItemModel>()

            rootDoc?.listFiles()?.forEach { file ->
                val mime = file.type ?: ""
                val name = file.name ?: ""
                val isVideo = mime.startsWith("video/") ||
                        name.endsWith(".mp4", true) ||
                        name.endsWith(".mkv", true) ||
                        name.endsWith(".avi", true) ||
                        name.endsWith(".mov", true)

                if (isVideo) {
                    val history = database.watchHistoryDao().getHistory(currentDriveId, file.uri.toString())
                    videoItems.add(
                        VideoAdapter.VideoItemModel(
                            id = file.uri.toString(),
                            name = name,
                            uri = file.uri,
                            sizeBytes = file.length(),
                            lastModified = file.lastModified(),
                            savedProgressMs = history?.lastPositionMs ?: 0L,
                            durationMs = history?.durationMs ?: 0L,
                            isCompleted = history?.isCompleted ?: false
                        )
                    )
                }
            }

            withContext(Dispatchers.Main) {
                videoAdapter.submitList(videoItems)
                binding.tvEmptyState.visibility = if (videoItems.isEmpty()) View.VISIBLE else View.GONE
            }
        }
    }

    private fun launchPlayer(item: VideoAdapter.VideoItemModel, startPositionMs: Long) {
        val intent = Intent(this, VlcPlayerActivity::class.java).apply {
            putExtra(VlcPlayerActivity.EXTRA_VIDEO_URI, item.uri.toString())
            putExtra(VlcPlayerActivity.EXTRA_VIDEO_TITLE, item.name)
            putExtra(VlcPlayerActivity.EXTRA_DRIVE_ID, currentDriveId)
            putExtra(VlcPlayerActivity.EXTRA_START_POS_MS, startPositionMs)
        }
        startActivity(intent)
    }

    private fun showAudioRoutingDialog() {
        // Displays available hardware audio sinks & automatic routing policy status
        audioRoutingHelper.refreshDevices()
        val active = audioRoutingHelper.activeDevice.value?.name ?: "Default Speaker"
        val policy = if (audioRoutingHelper.currentPolicy.value == AudioRoutingHelper.RoutingPolicy.AUTO_ANDROID) "Auto (Android)" else "Manual"
        Toast.makeText(this, "Active Audio: $active [$policy]", Toast.LENGTH_SHORT).show()
    }

    override fun onDestroy() {
        super.onDestroy()
        audioRoutingHelper.release()
    }
}
