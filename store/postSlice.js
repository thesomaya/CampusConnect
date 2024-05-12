import { createSlice } from "@reduxjs/toolkit";

const postSlice = createSlice({
    name: "posts",
    initialState: {
        postsData: {}
    },
    reducers: {
        setPostsData: (state, action) => {
            state.postsData ={ ...action.payload.postsData };
        }
    }
});
export const setPostsData = postSlice.actions.setPostsData;
export default postSlice.reducer;