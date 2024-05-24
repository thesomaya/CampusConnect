import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name: "chats",
    initialState: {
        chatsData: {}
    },
    reducers: {
        setChatsData: (state, action) => {
            state.chatsData ={ ...action.payload.chatsData };
        },
        updateChats: (state, action) => {
            state.chatsData = action.payload;
          },
        deleteChat(state, action) {
            delete state.chatsData[action.payload];
          },
    }
});
export const { setChatsData, updateChats, deleteChat } = chatSlice.actions;
export default chatSlice.reducer;