import mongoose, {Schema} from "mongoose"

const videoSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    
  },
  {
    timestamps: true
  }
)

export const Note = mongoose.model("Note", noteSchema)