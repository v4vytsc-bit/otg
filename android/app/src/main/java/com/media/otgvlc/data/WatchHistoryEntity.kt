package com.media.otgvlc.data

import androidx.room.Entity

@Entity(
    tableName = "watch_history",
    primaryKeys = ["driveId", "filePath"]
)
data class WatchHistoryEntity(
    val driveId: String,
    val filePath: String,
    val lastPositionMs: Long,
    val durationMs: Long,
    val isCompleted: Boolean,
    val updatedAt: Long
)
