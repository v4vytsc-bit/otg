package com.media.otgvlc.ui

import android.net.Uri
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.ProgressBar
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.bumptech.glide.load.engine.DiskCacheStrategy
import com.media.otgvlc.R

class VideoAdapter(
    private val onVideoClicked: (item: VideoItemModel, startPositionMs: Long) -> Unit
) : ListAdapter<VideoAdapter.VideoItemModel, VideoAdapter.VideoViewHolder>(DiffCallback) {

    data class VideoItemModel(
        val id: String,
        val name: String,
        val uri: Uri,
        val sizeBytes: Long,
        val lastModified: Long,
        val savedProgressMs: Long,
        val durationMs: Long,
        val isCompleted: Boolean
    )

    object DiffCallback : DiffUtil.ItemCallback<VideoItemModel>() {
        override fun areItemsTheSame(oldItem: VideoItemModel, newItem: VideoItemModel): Boolean =
            oldItem.id == newItem.id

        override fun areContentsTheSame(oldItem: VideoItemModel, newItem: VideoItemModel): Boolean =
            oldItem == newItem
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VideoViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_video_card, parent, false)
        return VideoViewHolder(view)
    }

    override fun onBindViewHolder(holder: VideoViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class VideoViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val thumbnail: ImageView = itemView.findViewById(R.id.ivThumbnail)
        private val title: TextView = itemView.findViewById(R.id.tvTitle)
        private val duration: TextView = itemView.findViewById(R.id.tvDuration)
        private val progressBar: ProgressBar = itemView.findViewById(R.id.progressWatch)
        private val badgeCompleted: View = itemView.findViewById(R.id.badgeCompleted)

        fun bind(item: VideoItemModel) {
            title.text = item.name

            // Load video frame thumbnail with Glide
            Glide.with(itemView.context)
                .asBitmap()
                .load(item.uri)
                .diskCacheStrategy(DiskCacheStrategy.ALL)
                .centerCrop()
                .into(thumbnail)

            // YouTube-style red progress bar
            if (item.durationMs > 0 && item.savedProgressMs > 0) {
                val progressPercent = ((item.savedProgressMs.toFloat() / item.durationMs) * 100).toInt()
                progressBar.visibility = View.VISIBLE
                progressBar.progress = progressPercent
            } else {
                progressBar.visibility = View.GONE
            }

            badgeCompleted.visibility = if (item.isCompleted) View.VISIBLE else View.GONE

            itemView.setOnClickListener {
                onVideoClicked(item, item.savedProgressMs)
            }
        }
    }
}
