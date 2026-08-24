package com.media.otgvlc.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface WatchHistoryDao {

    @Query("SELECT * FROM watch_history WHERE driveId = :driveId AND filePath = :filePath LIMIT 1")
    suspend fun getHistory(driveId: String, filePath: String): WatchHistoryEntity?

    @Query("SELECT * FROM watch_history WHERE driveId = :driveId")
    fun getAllHistoryForDrive(driveId: String): Flow<List<WatchHistoryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertHistory(history: WatchHistoryEntity)

    @Query("DELETE FROM watch_history WHERE driveId = :driveId AND filePath = :filePath")
    suspend fun deleteHistory(driveId: String, filePath: String)
}
